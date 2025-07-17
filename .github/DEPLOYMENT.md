# GitHub Pages Deployment Guide

This repository includes an automated GitHub Actions workflow that builds the WASM package and deploys the test suite to GitHub Pages.

## Setup Instructions

### 1. Enable GitHub Pages

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Pages**
3. Under "Source", select **GitHub Actions**
4. The workflow will automatically deploy on pushes to `main` or `master` branch

### 2. Access Your Test Suite

After the first successful deployment, your test suite will be available at:
```
https://YOUR-USERNAME.github.io/YOUR-REPOSITORY-NAME/
```

Example: `https://yourusername.github.io/comfy-table-wasm/`

### 3. Update README

Don't forget to update the README.md link to point to your actual GitHub Pages URL:
```markdown
**🌐 [View Live Test Suite](https://yourusername.github.io/comfy-table-wasm/)**
```

## Workflow Features

The GitHub Actions workflow includes:

### Build Process
- ✅ Rust toolchain setup with WASM target
- ✅ wasm-pack installation and build
- ✅ Node.js dependencies installation
- ✅ Rust tests, clippy, and formatting checks
- ✅ WASM package generation for both web and bundler targets

### Deployment
- ✅ Automatic deployment to GitHub Pages on main/master branch pushes
- ✅ Interactive test suite with comprehensive coverage
- ✅ Beautiful landing page with feature overview
- ✅ ANSI to HTML conversion demos
- ✅ Performance benchmarking tools

### Test Coverage
- ✅ **Synchronized Tests** (18 tests): Exact reproductions of original comfy-table tests
- ✅ **Extended Tests** (12 tests): Performance, edge cases, Unicode, and stress tests
- ✅ **Debug Tools**: Interactive debugging for failed tests
- ✅ **ANSI Support**: Beautiful color formatting converted to HTML

## Manual Deployment

If you need to deploy manually:

```bash
# Build WASM packages
wasm-pack build --target web --out-dir pkg-web --dev
wasm-pack build --target bundler --out-dir pkg --dev

# Create deployment directory
mkdir -p pages-deploy
cp -r test/ pages-deploy/
cp -r pkg-web/ pages-deploy/

# Deploy to your hosting service
```

## Troubleshooting

### Workflow Fails
- Check that GitHub Actions are enabled in your repository settings
- Ensure the repository is public or you have GitHub Pro/Team for private repo Pages
- Verify the workflow has proper permissions (should be automatic)

### Tests Fail
- The workflow runs Rust tests before deployment
- Check the "Actions" tab for detailed error logs
- Ensure all tests pass locally with `cargo test`

### Pages Not Loading
- Check that GitHub Pages is configured to use "GitHub Actions" as source
- Wait a few minutes after the first deployment
- Verify the workflow completed successfully in the Actions tab

## Repository Structure

```
.github/
  workflows/
    build-and-deploy.yml    # Main CI/CD workflow
  DEPLOYMENT.md            # This guide
test/
  comprehensive-test.html  # Main test runner
  test-suite-synchronized.js  # Original tests reproduction
  test-suite-extended.js   # Performance and edge cases
pkg-web/                   # WASM package for web
src/                       # Rust source code
```