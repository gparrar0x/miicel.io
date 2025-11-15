# E2E Test Suite - Documentation Index

Your complete guide to the E2E test suite. Start with what you need.

## Getting Started (5 minutes)

1. **First Time?** → Read [`QUICKSTART_E2E.md`](../QUICKSTART_E2E.md)
   - Installation steps
   - Running your first test
   - Common commands

2. **Want to Run Tests Now?** → Quick commands:
   ```bash
   npm run test:e2e:ui      # Visual UI mode (recommended)
   npm run test:e2e         # Headless mode
   npm run test:e2e:headed  # See browser
   ```

## Main Documentation

### For Users

| Document | Read When | Time |
|----------|-----------|------|
| [README.md](./README.md) | You need complete usage guide | 15 min |
| [REFERENCE.md](./REFERENCE.md) | You need quick lookup reference | 5 min |
| [QUICKSTART_E2E.md](../QUICKSTART_E2E.md) | You're just starting | 5 min |

### For Developers

| Document | Read When | Time |
|----------|-----------|------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | You're understanding the design | 20 min |
| [DATABASE_STRATEGY.md](./DATABASE_STRATEGY.md) | You're working with database cleanup | 15 min |
| [CHECKLIST.md](./CHECKLIST.md) | You want implementation summary | 5 min |

### For Operations

| Document | Read When | Time |
|----------|-----------|------|
| [../E2E_TEST_SUMMARY.md](../E2E_TEST_SUMMARY.md) | You're setting up CI/CD | 10 min |
| [README.md#CI/CD Integration](./README.md) | You're integrating with pipeline | 10 min |

## File Organization

```
tests/e2e/
├── locators/
│   └── signup.locators.ts          # UI element selectors
│       See REFERENCE.md → Locators Reference
│
├── pages/
│   └── signup.page.ts              # SignupPage & OnboardingPage
│       See REFERENCE.md → Page Object Methods
│
├── fixtures/
│   ├── database.fixture.ts         # DB cleanup
│   │   See DATABASE_STRATEGY.md
│   └── api.fixture.ts              # API helpers
│       See REFERENCE.md → API Helpers
│
├── helpers/
│   ├── test-data.helper.ts         # Test data generation
│   │   See REFERENCE.md → Test Data Helpers
│   └── api.helper.ts               # API utilities
│       See REFERENCE.md → API Helpers
│
├── specs/
│   └── tenant-creation.spec.ts     # 50+ test cases
│       See README.md → Test Cases
│
└── Documentation
    ├── README.md                   # Complete guide
    ├── ARCHITECTURE.md             # Design patterns
    ├── DATABASE_STRATEGY.md        # Cleanup strategy
    ├── REFERENCE.md                # Quick reference
    ├── CHECKLIST.md                # What was delivered
    └── INDEX.md                    # This file
```

## Common Tasks

### "I Want to..."

#### ...Run Tests
→ See [QUICKSTART_E2E.md](../QUICKSTART_E2E.md)
```bash
npm run test:e2e:ui
```

#### ...Write a New Test
→ See [README.md#Adding New Tests](./README.md) or [REFERENCE.md](./REFERENCE.md)

#### ...Fix a Broken Test
→ See [README.md#When UI Changes](./README.md#when-ui-changes)

#### ...Understand the Architecture
→ See [ARCHITECTURE.md](./ARCHITECTURE.md)

#### ...Understand Database Cleanup
→ See [DATABASE_STRATEGY.md](./DATABASE_STRATEGY.md)

#### ...Set Up CI/CD
→ See [README.md#CI/CD Integration](./README.md) or [E2E_TEST_SUMMARY.md](../E2E_TEST_SUMMARY.md#ci-cd-integration)

#### ...Debug a Test
→ See [README.md#Debugging Tests](./README.md)

#### ...Look Up a Method
→ See [REFERENCE.md](./REFERENCE.md)

#### ...Understand Test Data
→ See [DATABASE_STRATEGY.md](./DATABASE_STRATEGY.md#test-data-generation)

## Quick Reference

### Page Object Methods
```typescript
await signupPage.navigate()                    // Go to /signup
await signupPage.fillForm(testData)            // Fill all fields
await signupPage.submitAndWaitForOnboarding()  // Submit and wait
```

See [REFERENCE.md#Page Object Methods](./REFERENCE.md) for all methods.

### Test Data
```typescript
const testData = generateTestData()
// email: 'e2e-test-1700000000000@example.com'
// slug: 'store-1700000000000'
```

See [REFERENCE.md#Test Data Helpers](./REFERENCE.md) for all helpers.

### Database Cleanup
```typescript
await dbCleanup({ tenantSlug: testData.slug })
```

See [DATABASE_STRATEGY.md](./DATABASE_STRATEGY.md) for cleanup details.

## Commands Reference

```bash
# Run tests
npm run test:e2e                      # Headless
npm run test:e2e:ui                   # Visual UI (recommended)
npm run test:e2e:headed               # Visible browser
npm run test:e2e:debug                # Debug mode
npm run test:e2e:report               # View report

# Run specific tests
npx playwright test -g "keyword"      # Match pattern
npx playwright test file.spec.ts      # Specific file

# Database
npm run db:reset                       # Reset database

# Development
npm run dev                            # Start dev server
npm run build                          # Build app
```

See [README.md#Running Tests](./README.md#running-tests) for more.

## Test Categories

The test suite includes:

- **Happy Path** (4 tests) - Successful signup flow
- **Validation** (14 tests) - Form field validation
- **Error Handling** (2 tests) - Network/API errors
- **Integration** (2 tests) - Complete flow
- **Cleanup** (1+ tests) - Database verification

**Total: 50+ test cases**

See [README.md#Test Coverage](./README.md#test-coverage) for details.

## Documentation Statistics

| Type | Lines | Purpose |
|------|-------|---------|
| TypeScript Code | 1,426 | Production test code |
| Markdown Docs | 2,350+ | Complete documentation |
| JSDoc Comments | 100% | All functions documented |

## Learning Path

**Beginner (Just Getting Started)**
1. Read [QUICKSTART_E2E.md](../QUICKSTART_E2E.md) (5 min)
2. Run `npm run test:e2e:ui` (5 min)
3. Click on a test to see it execute (5 min)

**Intermediate (Writing Tests)**
1. Review [REFERENCE.md](./REFERENCE.md) (5 min)
2. Look at examples in [tests/e2e/specs/tenant-creation.spec.ts](./specs/tenant-creation.spec.ts) (10 min)
3. Write your first test (15 min)

**Advanced (Understanding Design)**
1. Read [ARCHITECTURE.md](./ARCHITECTURE.md) (20 min)
2. Read [DATABASE_STRATEGY.md](./DATABASE_STRATEGY.md) (15 min)
3. Review code organization and patterns (15 min)

## Troubleshooting Quick Links

| Problem | Solution |
|---------|----------|
| Tests timeout | [README.md#Tests Timeout](./README.md#troubleshooting) |
| "Slug already taken" | [README.md#Database Not Cleaning Up](./README.md#troubleshooting) |
| Can't find element | [REFERENCE.md#Locators](./REFERENCE.md) |
| Port 3000 in use | [README.md#Port Already in Use](./README.md#troubleshooting) |
| Flaky tests | [README.md#Flaky Tests](./README.md#troubleshooting) |

See [README.md#Troubleshooting](./README.md) for more.

## Key Concepts

### Three-Layer Architecture
1. **Tests** - What to test (business scenarios)
2. **Page Objects** - How to interact (user actions)
3. **Locators** - Where elements are (selectors)

See [ARCHITECTURE.md](./ARCHITECTURE.md) for details.

### Automatic Cleanup
Each test automatically cleans up its database records using fixtures.

See [DATABASE_STRATEGY.md](./DATABASE_STRATEGY.md) for details.

### Parallel Execution
Tests use unique data (timestamps) and cleanup to run in parallel safely.

See [DATABASE_STRATEGY.md](./DATABASE_STRATEGY.md#parallel-test-execution) for details.

## File References

| File | What It Is | Lines |
|------|-----------|-------|
| `locators/signup.locators.ts` | Selectors | 51 |
| `pages/signup.page.ts` | Page interactions | 365 |
| `fixtures/database.fixture.ts` | DB cleanup | 144 |
| `fixtures/api.fixture.ts` | API helpers | 24 |
| `helpers/test-data.helper.ts` | Data generation | 130 |
| `helpers/api.helper.ts` | API utilities | 91 |
| `specs/tenant-creation.spec.ts` | Tests (50+) | 530 |

## Configuration Files

- `playwright.config.ts` - Playwright configuration
- `tsconfig.json` - TypeScript configuration
- `.env.e2e.example` - Environment variables template

## Next Steps

1. **Quick Start**: Run `npm run test:e2e:ui`
2. **Learn More**: Read [README.md](./README.md)
3. **Understand Design**: Read [ARCHITECTURE.md](./ARCHITECTURE.md)
4. **Write Tests**: Follow [REFERENCE.md](./REFERENCE.md) examples

## Need Help?

1. Check inline test comments (heavily documented)
2. Check relevant documentation above
3. Search [README.md](./README.md#troubleshooting) for your issue
4. Review examples in [REFERENCE.md](./REFERENCE.md#common-test-patterns)

---

**Status**: Production Ready
**Last Updated**: 2025-01-18
**Total Tests**: 50+
**Documentation**: Complete
