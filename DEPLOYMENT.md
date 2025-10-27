# Deployment Guide for Render

This guide explains how to deploy the E621rdle application to Render.

## Prerequisites

- Render account
- GitHub repository with the code
- Node.js 18+ environment

## Render Configuration

### Option 1: Using render.yaml (Recommended)

The project includes a `render.yaml` file that automatically configures the deployment:

```yaml
services:
  - type: web
    name: e621rdle
    env: node
    buildCommand: npm install && npm run build
    startCommand: node server.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
```

### Option 2: Manual Configuration

If not using `render.yaml`, configure these settings in the Render dashboard:

- **Build Command**: `npm install && npm run build`
- **Start Command**: `node server.js`
- **Environment**: `Node`
- **Node Version**: `18` or higher

## Environment Variables

Set these environment variables in the Render dashboard:

- `NODE_ENV`: `production`
- `PORT`: `10000` (or let Render assign automatically)

## Build Process

The build process includes:

1. **Install Dependencies**: `npm install`
2. **Build Frontend**: `vite build` (creates `dist` folder)
3. **Verify Build**: `node scripts/verify-build.js` (ensures build completed)
4. **Start Server**: `node server.js`

## Troubleshooting

### Error: ENOENT: no such file or directory, stat '/opt/render/project/src/dist/index.html'

This error occurs when the server tries to serve files before the build is complete. The updated server.js now includes:

- **Build Verification**: Checks if `dist` folder exists before serving
- **Graceful Fallback**: Shows helpful error messages if build is missing
- **Debug Logging**: Logs build status for troubleshooting

### Common Issues

1. **Build Fails**: Check the build logs in Render dashboard
2. **Missing Dependencies**: Ensure all dependencies are in `package.json`
3. **Path Issues**: The server looks for files in `dist/` not `src/dist/`
4. **Environment Variables**: Ensure `NODE_ENV=production` is set

### Debug Information

The server logs include debug information in production:

```
Server running on port 10000
Database location: /opt/render/project/database.sqlite
Environment: production
Dist folder exists: true
Dist folder contents: index.html, assets/
```

## Database Setup

The application uses SQLite and will create the database automatically. For production, consider:

1. **Database Seeding**: Run `npm run seed` after deployment
2. **Persistent Storage**: Ensure Render has persistent disk storage
3. **Backup Strategy**: Regular database backups

## Performance Considerations

- **Prefetching**: The app includes smart prefetching for better performance
- **Static Assets**: Vite optimizes assets during build
- **Caching**: Express serves static files efficiently

## Monitoring

Monitor these metrics in Render:

- **Build Time**: Should complete in 2-3 minutes
- **Memory Usage**: Typically 50-100MB
- **Response Time**: API calls should be < 200ms
- **Error Rate**: Should be minimal

## Rollback Strategy

If deployment fails:

1. Check build logs for errors
2. Verify environment variables
3. Test build locally: `npm run build`
4. Redeploy from previous commit if needed

## Support

For issues:

1. Check Render build logs
2. Verify all environment variables
3. Test locally with `NODE_ENV=production`
4. Check the application logs for debug information
