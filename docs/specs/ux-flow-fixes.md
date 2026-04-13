# UX Flow Fixes: Media Upload + Content→Social Bridge

**Agent:** Aurora  
**Status:** Design Spec  
**Priority:** High (Blocking SKY-58, SKY-186)  
**Estimate:** 8-10h (3h design + 5-7h Pixel implementation)  

---

## Overview

Three blocking UX issues prevent the content generation → social publishing pipeline from working:

1. **PostCreator has no way to add media** — users open "New Post" dialog but can't upload images
2. **No bridge from Content Pipeline → Instagram** — generated assets are orphaned in AssetGallery
3. **GenerationHistory not discoverable** — component exists but isn't integrated in product page

This spec defines the exact UI changes, component modifications, and new props needed to fix all three issues.

---

## Problem 1: PostCreator Media Upload

### Current State
- `PostCreator` accepts `mediaUrls` prop only
- When opened from SocialDashboardPage "New Post" button, **no URLs passed** → "No media selected" with no way to add media
- Users are stuck

### Solution
Add a media input section above the existing media preview grid:

```
┌─────────────────────────────────────────────┐
│ Publish to Instagram                        │
├─────────────────────────────────────────────┤
│                                             │
│ Post Type: [IMAGE ▼]                        │
│                                             │
│ Media Upload                                │
│ ┌───────────────────────────────────────┐  │
│ │ Drop images here or paste URL         │  │
│ │ [Browse files]  [Paste URL]           │  │
│ └───────────────────────────────────────┘  │
│                                             │
│ Media (2 added)                             │
│ ┌─┬─┬─┐                                     │
│ │1│2│ │  [+ Add more]                     │
│ └─┴─┴─┘                                     │
│                                             │
│ Caption: [textarea]                         │
│ ...                                         │
├─────────────────────────────────────────────┤
│ [Cancel] [Publish Now]                      │
└─────────────────────────────────────────────┘
```

### Component Changes

#### PostCreator.tsx

**New Props:**
```tsx
interface PostCreatorProps {
  // ... existing
  mediaUrls?: string[]
  // NEW: allow user to add media if not provided
  onMediaAdded?: (urls: string[]) => void
  // NEW: product context for fetching product images
  productId?: number
}
```

**New State:**
```tsx
const [mediaUrls, setMediaUrls] = useState<string[]>(initialMediaUrls ?? [])
const [urlInput, setUrlInput] = useState('')
const [fileInput, setFileInput] = useState<HTMLInputElement | null>(null)
const [uploading, setUploading] = useState(false)
```

**New Event Handlers:**
```tsx
// Handle URL paste
const addMediaUrl = (url: string) => {
  if (url.trim() && !mediaUrls.includes(url)) {
    setMediaUrls([...mediaUrls, url])
    setUrlInput('')
  }
}

// Handle file upload
const handleFileSelect = async (files: FileList) => {
  setUploading(true)
  for (const file of files) {
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/content/upload', {
        method: 'POST',
        body: formData,
      })
      if (res.ok) {
        const { url } = await res.json()
        setMediaUrls(prev => [...prev, url])
      }
    } catch (err) {
      setError(`Upload failed: ${file.name}`)
    }
  }
  setUploading(false)
}
```

**New UI Section (insert before Media Preview at line 189):**
```tsx
{/* Media Upload Input */}
<div className="grid gap-2">
  <Label className="flex items-center gap-2 text-[var(--color-text-primary)]">
    <Upload className="h-4 w-4" />
    Add Media
  </Label>

  {/* URL Paste Input */}
  <div className="flex gap-2">
    <Input
      data-testid="media-url-input"
      placeholder="Paste image URL..."
      value={urlInput}
      onChange={(e) => setUrlInput(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          addMediaUrl(urlInput)
        }
      }}
      className="flex-1"
    />
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => addMediaUrl(urlInput)}
      disabled={!urlInput.trim()}
      data-testid="add-media-url-btn"
    >
      Add URL
    </Button>
  </div>

  {/* File Upload */}
  <Button
    type="button"
    variant="outline"
    size="sm"
    onClick={() => fileInput?.click()}
    disabled={uploading}
    className="w-full"
    data-testid="upload-media-btn"
  >
    {uploading ? (
      <>
        <Loader2 className="h-4 w-4 animate-spin" />
        Uploading...
      </>
    ) : (
      <>
        <Upload className="h-4 w-4" />
        Upload from Device
      </>
    )}
  </Button>

  <input
    ref={setFileInput}
    type="file"
    accept="image/*"
    multiple
    hidden
    onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
    data-testid="file-input"
  />

  <p className="text-xs text-muted-foreground">
    Supported: JPG, PNG, GIF, WebP (max 10MB each)
  </p>
</div>
```

**Import additions:**
```tsx
import { Upload, Loader2 } from 'lucide-react' // add Upload
```

**New test IDs (in component):**
- `media-url-input` — URL paste input field
- `add-media-url-btn` — Add URL button
- `upload-media-btn` — Upload file button
- `file-input` — Hidden file input

**Fix for empty media default:**
```tsx
// Line 57: Change from
const [mediaUrls, setMediaUrls] = useState<string[]>(initialMediaUrls)

// To:
const [mediaUrls, setMediaUrls] = useState<string[]>(initialMediaUrls ?? [])
```

---

## Problem 2: No Bridge from Content Pipeline → Instagram

### Current State
- Users generate content in AssetGallery (images, videos, reels)
- Gallery has **download buttons only** — no way to publish
- GenerationHistory exists but is orphaned
- Dead end after generation

### Solution
Add "Publish to Instagram" buttons to AssetGallery cards:

```
Asset Card:
┌──────────────┐
│   [Image]    │  ← Each asset card
│   [Type]     │
│              │
│ ┌───────────┐│  ← NEW: Hover overlay
│ │[Publish] ││     with Publish button
│ │  to IG   ││
│ └───────────┘│
│              │
│ [Download]   │
└──────────────┘
```

### Component Changes

#### AssetGallery.tsx

**New Props:**
```tsx
interface AssetGalleryProps {
  assets: Asset[]
  // NEW: callback to open PostCreator
  onPublishClick?: (assetUrls: string[]) => void
  // NEW: pass generation ID for tracking
  generationId?: string
}
```

**New Event Handler (add after handleDownload):**
```tsx
const handlePublish = useCallback((url: string) => {
  onPublishClick?.([url])
}, [onPublishClick])
```

**Updated Asset Card UI (modify lines 86-155):**

Replace the download overlay with dual-action overlay:

```tsx
{/* Action Overlay */}
{asset.public_url && (
  <div
    className={cn(
      'absolute inset-0 flex items-center justify-center gap-2',
      'bg-black/0 opacity-0 transition-all',
      'group-hover:bg-black/50 group-hover:opacity-100',
      'focus-visible:bg-black/50 focus-visible:opacity-100',
    )}
  >
    {/* Publish Button */}
    <button
      data-testid="publish-asset-btn"
      onClick={() => handlePublish(asset.public_url!)}
      className="rounded-full bg-[var(--color-accent-primary)] p-2 text-white hover:bg-[var(--color-accent-hover)] transition-colors"
      aria-label={`Publish ${asset.asset_type} to Instagram`}
      title="Publish to Instagram"
    >
      <Instagram className="h-5 w-5" />
    </button>

    {/* Download Button */}
    <button
      data-testid="download-asset-btn"
      onClick={() =>
        handleDownload(
          asset.public_url!,
          `${asset.asset_type}-${asset.id.slice(0, 8)}`,
        )
      }
      className="rounded-full bg-black/40 p-2 text-white hover:bg-black/60 transition-colors"
      aria-label={`Download ${asset.asset_type}`}
    >
      <Download className="h-5 w-5" />
    </button>
  </div>
)}
```

**Import additions:**
```tsx
import { Instagram } from 'lucide-react' // add Instagram icon
```

**New test IDs:**
- `publish-asset-btn` — Publish to Instagram button (per asset card)

**Parent integration (SocialDashboardPage or whoever uses AssetGallery):**

```tsx
// In parent component (e.g., content/ContentGenerationPage or similar):
const [creatorOpen, setCreatorOpen] = useState(false)
const [creatorMediaUrls, setCreatorMediaUrls] = useState<string[]>([])

const handlePublishAsset = (urls: string[]) => {
  setCreatorMediaUrls(urls)
  setCreatorOpen(true)
}

return (
  <>
    <AssetGallery 
      assets={assets} 
      onPublishClick={handlePublishAsset}
      generationId={generationId}
    />
    
    <PostCreator
      open={creatorOpen}
      onOpenChange={setCreatorOpen}
      tenantId={tenantId}
      mediaUrls={creatorMediaUrls}
      productId={productId}
      generationId={generationId}
      onPublished={() => {
        setCreatorOpen(false)
        setCreatorMediaUrls([])
      }}
    />
  </>
)
```

---

## Problem 3: GenerationHistory Not Integrated

### Current State
- `GenerationHistory` component exists and works standalone
- It is **not displayed anywhere** in the product UI
- Users have no way to re-publish past generations or see history

### Solution
Integrate GenerationHistory into the product detail page:

```
Product Detail Page:
┌──────────────────────────────────────┐
│ Product Name                         │
├──────────────────────────────────────┤
│ [Details] [History] [Generations]    │  ← New tab
├──────────────────────────────────────┤
│                                      │
│ Tabs/Collapsible:                    │
│                                      │
│ Generation History                   │
│ ├─ 2026-04-07 • Completed • 3 assets│
│ │  └─ [Expand] AssetGallery         │
│ │     [Publish to IG] [Download All]│
│ │                                    │
│ ├─ 2026-04-06 • Failed               │
│ └─ ...                               │
│                                      │
└──────────────────────────────────────┘
```

### Two Integration Options

#### Option A: Collapsible Section (RECOMMENDED - MVP)
Add as collapsible section in product detail page:

```tsx
// In ProductDetailPage or similar:
const [historyOpen, setHistoryOpen] = useState(false)

return (
  <>
    {/* Existing product details */}
    
    {/* NEW: Generation History Section */}
    <Collapsible
      open={historyOpen}
      onOpenChange={setHistoryOpen}
      className="mt-8 border-t border-[var(--color-border-subtle)] pt-6"
    >
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between p-0"
          data-testid="generation-history-toggle"
        >
          <div className="flex items-center gap-2">
            <History className="h-4 w-4" />
            <span>Generation History</span>
          </div>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-4">
        <GenerationHistory
          tenantId={tenantId}
          productId={productId}
        />
      </CollapsibleContent>
    </Collapsible>
  </>
)
```

#### Option B: Tab in Product Details
Add `<GenerationHistory />` as a separate tab:

```tsx
<Tabs defaultValue="details">
  <TabsList>
    <TabsTrigger value="details">Details</TabsTrigger>
    <TabsTrigger value="history" data-testid="product-tab-history">
      Generation History
    </TabsTrigger>
  </TabsList>

  <TabsContent value="details">
    {/* existing product details */}
  </TabsContent>

  <TabsContent value="history" className="mt-4">
    <GenerationHistory tenantId={tenantId} productId={productId} />
  </TabsContent>
</Tabs>
```

**Recommendation:** Start with **Option A (Collapsible)** — less disruptive, can upgrade to tabs later.

### Component Changes

#### GenerationHistory.tsx (Minor)
**Add callback for "Publish" action on each history item:**

```tsx
interface GenerationHistoryProps {
  tenantId: number
  productId: number
  // NEW: callback when user wants to publish a generation
  onPublishGeneration?: (assetUrls: string[]) => void
}
```

**Update expanded asset gallery to include publish:**

```tsx
{expandedJob?.assets && expandedJob.assets.length > 0 ? (
  <div className="space-y-3">
    <AssetGallery 
      assets={expandedJob.assets}
      onPublishClick={onPublishGeneration}
      generationId={gen.id}
    />
  </div>
) : null}
```

**Parent integration (ProductDetailPage):**

```tsx
const [creatorOpen, setCreatorOpen] = useState(false)
const [creatorMediaUrls, setCreatorMediaUrls] = useState<string[]>([])

const handlePublishHistoryGeneration = (urls: string[]) => {
  setCreatorMediaUrls(urls)
  setCreatorOpen(true)
}

return (
  <>
    {/* Product details */}
    
    <Collapsible ...>
      <GenerationHistory
        tenantId={tenantId}
        productId={productId}
        onPublishGeneration={handlePublishHistoryGeneration}
      />
    </Collapsible>

    <PostCreator
      open={creatorOpen}
      onOpenChange={setCreatorOpen}
      tenantId={tenantId}
      mediaUrls={creatorMediaUrls}
      productId={productId}
      onPublished={() => {
        setCreatorOpen(false)
        setCreatorMediaUrls([])
      }}
    />
  </>
)
```

---

## Data Flow Diagram

```
User Journey (Fixed):

1. Product Page
   ├─ Generate Content
   │  └─ GenerationConfigPanel → POST /api/content/generate
   │
   ├─ View History (NEW)
   │  └─ GenerationHistory (collapsible)
   │     ├─ AssetGallery (with publish button)
   │     └─ onPublishGeneration → open PostCreator
   │
   └─ Publish to Instagram
      ├─ New Post → PostCreator (with media upload)
      │  └─ Add media via: URL paste, file upload
      │
      ├─ OR from AssetGallery
      │  └─ Click "Publish to Instagram" → PostCreator (pre-filled)
      │
      └─ Submit → POST /api/social/publish

Result: Complete pipeline SKY-58 (generate) → SKY-186 (publish)
```

---

## Test IDs Mandatory for Pixel + Centinela

### PostCreator
- `post-creator` (dialog root — existing)
- `media-url-input` (URL input field) — **NEW**
- `add-media-url-btn` (Add URL button) — **NEW**
- `upload-media-btn` (Upload file button) — **NEW**
- `file-input` (hidden file input) — **NEW**
- `media-picker` (grid container — existing)
- `media-item-${i}` (each media card — existing)

### AssetGallery
- `asset-gallery` (root — existing)
- `asset-card-${type}-${idx}` (each card — existing)
- `publish-asset-btn` (Publish button on each card) — **NEW**
- `download-asset-btn` (Download button) — **NEW**

### GenerationHistory
- `generation-history` (root — existing)
- `history-item-${index}` (each item — existing)
- `generation-history-toggle` (Collapsible trigger) — **NEW**

---

## API Requirements

**Pixel + Kokoro coordination:**

### Upload Endpoint (if not exists)
```
POST /api/content/upload
- Content-Type: multipart/form-data
- Body: { file: File }
- Returns: { url: string, size_bytes: number }
```

If already exists, use it. If not, Kokoro must add in parallel.

### Existing Endpoints (used as-is)
- `POST /api/social/publish` — already exists, works
- `POST /api/content/generate` — already exists, works
- `GET /api/content/history` — already exists, works
- `GET /api/content/jobs/{id}` — already exists, works

---

## Responsive Behavior

### Mobile (< 768px)
- **PostCreator**: Full-width dialog, scroll Y
- **AssetGallery**: Single column grid
- **Upload buttons**: Stack vertically
- **URL input + button**: Stack on small screens, row on larger

### Tablet (768-1024px)
- **AssetGallery**: 2-column grid
- Layout unchanged

### Desktop (> 1024px)
- **AssetGallery**: 3-4 column grid
- All actions same

---

## Accessibility

- **Upload input:** Proper `accept` attribute, file type validation
- **Buttons:** All have `aria-label` (e.g., "Upload media file")
- **Keyboard:** URL input on Enter adds URL; Tab/Shift+Tab navigates
- **Focus:** Visible focus rings on all interactive elements
- **Color contrast:** All buttons pass WCAG AA (4.5:1 minimum)
- **Feedback:** Error messages for invalid URLs, upload failures, etc.

---

## Styling Notes

- Use CSS variables from `styles/tokens.css` (no hardcoded colors)
- Buttons: shadcn/ui `Button` component (variant: outline, primary, ghost)
- Icons: lucide-react (Instagram, Upload, Download, History, ChevronRight, etc.)
- Spacing: 8px grid system (gap-2, gap-3, gap-4, etc.)
- Borders: `border-[var(--color-border-subtle)]`
- Text colors: `text-[var(--color-text-primary)]`, `text-[var(--color-text-secondary)]`

---

## Implementation Order (for Pixel)

1. **PostCreator Media Upload** (2-3h)
   - Add URL input + file upload
   - Add state for media URLs
   - Add handlers + validation
   - Test with real uploads

2. **AssetGallery Publish Button** (1.5-2h)
   - Add Instagram icon + button to overlay
   - Add callback prop
   - Integrate with parent PostCreator
   - Test publish flow

3. **GenerationHistory Integration** (1.5-2h)
   - Add collapsible section to product detail page
   - Wire onPublishGeneration callback
   - Test expand/collapse
   - Test publish from history

4. **E2E Tests** (1-2h) — Centinela
   - Upload → Preview → Publish flow
   - Publish from AssetGallery
   - Publish from History
   - Verify all data-testid present

---

## Dependencies & Blockers

- ✅ PostCreator component exists
- ✅ AssetGallery component exists
- ✅ GenerationHistory component exists
- ⏳ Upload endpoint — verify exists with Kokoro
- ⏳ Product detail page structure — Pixel confirms integration point

---

## References

- `components/social/PostCreator.tsx` — current implementation
- `components/content/AssetGallery.tsx` — current implementation
- `components/content/GenerationHistory.tsx` — current implementation
- `docs/TEST_ID_CONTRACT.md` — test ID conventions
- `docs/specs/PIXEL_COMPONENT_GUIDE.md` — component patterns

---

## Notes

- **No breaking changes** — all additions are additive (new props, new UI sections)
- **Backward compatible** — PostCreator still works with `mediaUrls` prop only
- **Reuse GenerationHistory as-is** — just integrate into visibility (no component changes needed except callback)
- **MVP scope** — basic URL paste + file upload, no advanced features (drag-drop v2, image crop v2)
- **Success metric** — users can complete full flow: generate → publish to Instagram without leaving Micelio

