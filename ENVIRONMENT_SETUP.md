# Environment Files Setup

## Environment Configuration

This project uses environment files for configuration. These files are not tracked in Git for security reasons.

### Setup Instructions

1. Copy the sample environment file to create your local environment files:

```bash
cp src/environments/environment.sample.ts src/environments/environment.ts
cp src/environments/environment.sample.ts src/environments/environment.prod.ts
```

2. Modify the files according to your environment:
   - `environment.ts` - Development environment settings
   - `environment.prod.ts` - Production environment settings

### Environment File Replacement

The application uses file replacement during the build process:
- When building for production (`ng build`), `environment.ts` is replaced with `environment.prod.ts`
- When building for development (`ng serve`), `environment.ts` is used as is

## Why Environment Files Aren't Tracked

Environment files often contain sensitive information like API keys and service URLs that shouldn't be committed to source control. 

If your environment files were previously being tracked despite being in .gitignore, it's because Git doesn't automatically stop tracking files that are already tracked when you add them to .gitignore. 

The project has been updated to remove these files from Git tracking while keeping your local files intact.
