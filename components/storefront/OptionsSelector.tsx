'use client'

/**
 * OptionsSelector Component - Product Detail
 *
 * Features:
 * - Tabs: Digital/Physical (if both types)
 * - Radio group: Select one option
 * - Specs: Bullet list per option
 * - Price inline per option
 * - Out of stock: Gray out, disable, badge
 * - 48x48px tap targets (WCAG AA)
 *
 * Edge cases: Single type (no tabs), single option (no radio)
 */

import { useState } from 'react'

interface ProductOption {
  id: string
  type: 'digital' | 'physical'
  title: string
  specs: string[]
  price: number
  currency: string
  stock: number
  sku: string
}

interface OptionsSelectorProps {
  options: ProductOption[]
  selectedOptionId?: string
  onSelectOption: (optionId: string) => void
  'data-testid'?: string
}

export function OptionsSelector({
  options,
  selectedOptionId,
  onSelectOption,
  'data-testid': testId = 'options-selector',
}: OptionsSelectorProps) {
  const digitalOptions = options.filter((opt) => opt.type === 'digital')
  const physicalOptions = options.filter((opt) => opt.type === 'physical')
  const hasBothTypes = digitalOptions.length > 0 && physicalOptions.length > 0

  const [activeTab, setActiveTab] = useState<'digital' | 'physical'>(
    digitalOptions.length > 0 ? 'digital' : 'physical'
  )

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(price)
  }

  const filteredOptions = hasBothTypes
    ? options.filter((opt) => opt.type === activeTab)
    : options

  const handleSelect = (optionId: string) => {
    const option = options.find((opt) => opt.id === optionId)
    if (option && option.stock > 0) {
      onSelectOption(optionId)
    }
  }

  return (
    <section className="options-selector" data-testid={testId}>
      {/* Tabs (if both types) */}
      {hasBothTypes && (
        <div className="options-tabs" role="tablist" data-testid="options-tabs">
          <button
            role="tab"
            aria-selected={activeTab === 'digital'}
            onClick={() => setActiveTab('digital')}
            data-testid="options-tab-digital"
          >
            🖼️ Digital
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'physical'}
            onClick={() => setActiveTab('physical')}
            data-testid="options-tab-physical"
          >
            🎨 Physical
          </button>
        </div>
      )}

      {/* Options List */}
      <div
        className="options-tabpanel"
        role="tabpanel"
        data-testid="options-tabpanel"
      >
        <fieldset>
          <legend className="sr-only">Select option</legend>
          {filteredOptions.map((option) => (
            <label
              key={option.id}
              className={`option-card ${option.stock === 0 ? 'out-of-stock' : ''} ${selectedOptionId === option.id ? 'selected' : ''}`}
              data-testid={`option-label-${option.id}`}
            >
              <input
                type="radio"
                name="product-option"
                value={option.id}
                checked={selectedOptionId === option.id}
                onChange={() => handleSelect(option.id)}
                disabled={option.stock === 0}
                data-testid={`option-radio-${option.id}`}
              />

              <div className="option-content">
                <div className="option-header">
                  <span className="option-title">{option.title}</span>
                  <span className="option-price">
                    {formatPrice(option.price, option.currency)}
                  </span>
                </div>

                <ul
                  className="option-specs"
                  data-testid={`option-specs-${option.id}`}
                >
                  {option.specs.map((spec, idx) => (
                    <li key={idx}>{spec}</li>
                  ))}
                </ul>

                {option.stock === 0 && (
                  <span className="out-of-stock-badge">Out of Stock</span>
                )}
              </div>
            </label>
          ))}
        </fieldset>
      </div>

      <style jsx>{`
        .options-selector {
          padding: 0 var(--spacing-sm) var(--spacing-md);
        }

        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }

        /* Tabs */
        .options-tabs {
          display: flex;
          border-bottom: 1px solid var(--color-border-subtle);
          margin-bottom: var(--spacing-md);
        }

        .options-tabs button {
          flex: 1;
          height: var(--tap-target-min);
          font-size: var(--font-size-body);
          font-weight: var(--font-weight-medium);
          color: var(--color-text-secondary);
          background: none;
          border: none;
          border-bottom: 3px solid transparent;
          cursor: pointer;
          transition: all 200ms;
        }

        .options-tabs button[aria-selected='true'] {
          color: var(--color-accent-primary);
          border-bottom-color: var(--color-accent-primary);
        }

        /* Options tabpanel */
        .options-tabpanel fieldset {
          border: none;
          padding: 0;
          margin: 0;
        }

        /* Option cards */
        .option-card {
          display: flex;
          align-items: flex-start;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm);
          border: 2px solid var(--color-border-subtle);
          border-radius: 8px;
          margin-bottom: var(--spacing-sm);
          cursor: pointer;
          transition: all 200ms;
          background: var(--color-bg-primary);
        }

        .option-card:hover:not(.out-of-stock) {
          border-color: var(--color-accent-primary);
        }

        .option-card.selected {
          border-color: var(--color-accent-primary);
          background: #fffbf0; /* Light gold tint */
        }

        .option-card.out-of-stock {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Radio button */
        .option-card input[type='radio'] {
          width: 24px;
          height: 24px;
          margin-top: 2px;
          accent-color: var(--color-accent-primary);
          cursor: pointer;
        }

        .option-card.out-of-stock input[type='radio'] {
          cursor: not-allowed;
        }

        /* Option content */
        .option-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .option-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
        }

        .option-title {
          font-size: var(--font-size-body);
          font-weight: var(--font-weight-medium);
          color: var(--color-text-primary);
        }

        .option-price {
          font-size: 18px;
          font-weight: var(--font-weight-bold);
          color: var(--color-accent-primary);
        }

        /* Specs list */
        .option-specs {
          list-style: disc;
          padding-left: 20px;
          margin: 0;
          font-size: var(--font-size-small);
          color: var(--color-text-secondary);
        }

        .option-specs li {
          line-height: var(--line-height-normal);
        }

        /* Out of stock badge */
        .out-of-stock-badge {
          display: inline-block;
          padding: 4px 8px;
          font-size: var(--font-size-tiny);
          font-weight: var(--font-weight-medium);
          color: var(--badge-limited-text);
          background: var(--badge-limited-bg);
          border-radius: 4px;
          text-transform: uppercase;
        }
      `}</style>
    </section>
  )
}
