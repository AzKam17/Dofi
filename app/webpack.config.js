const Encore = require('@symfony/webpack-encore');

// Manually configure the runtime environment if not already configured yet by the "encore" command.
// It's useful when you use tools that rely on webpack.config.js file.
if (!Encore.isRuntimeEnvironmentConfigured()) {
    Encore.configureRuntimeEnvironment(process.env.NODE_ENV || 'dev');
}

Encore
    // directory where compiled assets will be stored
    .setOutputPath('public/build/')
    // public path used by the web server to access the output path
    .setPublicPath('/build')
    // only needed for CDN's or subdirectory deploy
    //.setManifestKeyPrefix('build/')

    /*
     * ENTRY CONFIG
     *
     * Each entry will result in one JavaScript file (e.g. app.js)
     * and one CSS file (e.g. app.css) if your JavaScript imports CSS.
     */
    .addEntry('app', './assets/app.tsx')
    .addEntry('auth-login', './assets/auth-login.tsx')
    .addEntry('auth-verify', './assets/auth-verify.tsx')
    .addEntry('onboarding', './assets/onboarding.tsx')
    .addEntry('home', './assets/home.tsx')
    .addEntry('menu-page', './assets/menu-page.tsx')
    .addEntry('restaurant-public', './assets/restaurant-public.tsx')
    .addEntry('settings', './assets/settings.tsx')
    .addEntry('qr-codes', './assets/qr-codes.tsx')
    .addEntry('notifications-page', './assets/notifications-page.tsx')

    // When enabled, Webpack "splits" your files into smaller pieces for greater optimization.
    .splitEntryChunks()

    // will require an extra script tag for runtime.js
    // but, you probably want this, unless you're building a single-page app
    .enableSingleRuntimeChunk()

    /*
     * FEATURE CONFIG
     *
     * Enable & configure other features below. For a full
     * list of features, see:
     * https://symfony.com/doc/current/frontend.html#adding-more-features
     */
    .cleanupOutputBeforeBuild()

    // Displays build status system notifications to the user
    // .enableBuildNotifications()

    .enableSourceMaps(!Encore.isProduction())
    // enables hashed filenames (e.g. app.abc123.css)
    .enableVersioning(Encore.isProduction())

    // configure Babel
    .configureBabel((config) => {
        config.presets.push('@babel/preset-typescript');
    })

    // enables and configure @babel/preset-env polyfills
    .configureBabelPresetEnv((config) => {
        config.useBuiltIns = 'usage';
        config.corejs = '3.38';
    })

    // enables Sass/SCSS support
    //.enableSassLoader()

    // enable TypeScript
    .enableTypeScriptLoader()

    // enable React (this adds preset-react automatically)
    .enableReactPreset()

    // enable PostCSS for Tailwind
    .enablePostCssLoader()

    // uncomment to get integrity="..." attributes on your script & link tags
    // requires WebpackEncoreBundle 1.4 or higher
    //.enableIntegrityHashes(Encore.isProduction())

    // uncomment if you're having problems with a jQuery plugin
    //.autoProvidejQuery()
;

const config = Encore.getWebpackConfig();

// Add path alias for @ to assets directory
config.resolve.alias = {
    ...config.resolve.alias,
    '@': __dirname + '/assets'
};

module.exports = config;
