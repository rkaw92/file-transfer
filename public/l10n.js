import { negotiateLanguages } from '@fluent/langneg';
import { FluentBundle, FluentResource } from '@fluent/bundle';
import { ReactLocalization } from '@fluent/react';
import en from './translations/en.ftl';
import pl from './translations/pl.ftl';

const RESOURCES = {
    'en': new FluentResource(en),
    'pl': new FluentResource(pl),
};

function* generateBundles(userLocales) {
    // Choose locales that are best for the user.
    const currentLocales = negotiateLanguages(
        userLocales,
        [ 'en', 'pl' ],
        { defaultLocale: 'en' }
    );

    for (const locale of currentLocales) {
        const bundle = new FluentBundle(locale);
        bundle.addResource(RESOURCES[locale]);
        yield bundle;
    }
}

// The ReactLocalization instance stores and caches the sequence of generated
// bundles. You can store it in your app's state.
const l10n = new ReactLocalization(generateBundles(navigator.languages));

export { l10n };
