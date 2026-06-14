/**
 *  translation module
 *  1. lang.t('a')  ->  {a: 'hello'} -> hello
 *  2. lang.t('a', {b: 'world'}) -> {a: 'hello {{b}}'} -> hello world
 *  3. lang.t('a', {count: '2'}) -> {a: '{{count}} apple || {{count}} apples'} -> 2 apples
 *  4. lang.t('a', {interval_count: '5'}) ->
 *   {a: '(1){one};(2-4){some};(5-inf){many}'} -> many
 */

import invariant from 'invariant';
import _isPlainObject from 'lodash/isPlainObject';
import _isFinite from 'lodash/isFinite';

class Lang {
  static delimeter = '||';

  static tokenRegex = /\{\{(.*?)\}\}/g;

  static intervalSeparator = ';';

  static intervalRegex = /^\((\S*)\){(.*)}$/;

  // Mapping from pluralization group plural logic.
  static pluralTypes = {
    arabic(n) {
      // http://www.arabeyes.org/Plural_Forms
      if (n < 3) {
        return n;
      }
      if (n % 100 >= 3 && n % 100 <= 10) {
        return 3;
      }
      return n % 100 >= 11 ? 4 : 5;
    },
    chinese() {
      return 0;
    },
    german(n) {
      return n !== 1 ? 1 : 0;
    },
    french(n) {
      return n > 1 ? 1 : 0;
    },
    russian(n) {
      if (n % 10 === 1 && n % 100 !== 11) {
        return 0;
      }
      return n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2;
    },
    czech(n) {
      if (n === 1) {
        return 0;
      }
      return n >= 2 && n <= 4 ? 1 : 2;
    },
    polish(n) {
      if (n === 1) {
        return 0;
      }
      return n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2;
    },
    icelandic(n) {
      return n % 10 !== 1 || n % 100 === 11 ? 1 : 0;
    },
  };

  // Mapping from pluralization group to individual locales.
  static pluralTypeToLanguages = {
    arabic: ['ar'],
    chinese: ['fa', 'id', 'ja', 'ko', 'lo', 'ms', 'th', 'tr', 'zh'],
    german: ['da', 'de', 'en', 'es', 'fi', 'el', 'he', 'hu', 'it', 'nl', 'no', 'pt', 'sv'],
    french: ['fr', 'tl', 'pt-br'],
    russian: ['hr', 'ru', 'lt'],
    czech: ['cs', 'sk'],
    polish: ['pl'],
    icelandic: ['is'],
  };

  static pluralTypeName(locale) {
    const langToPluralType = {};
    Object.keys(Lang.pluralTypeToLanguages).forEach((key) =>
      Lang.pluralTypeToLanguages[key].forEach((currentLang) => {
        langToPluralType[currentLang] = key;
      })
    );

    return langToPluralType[locale] || langToPluralType[locale.split(/-/, 1)[0]] || langToPluralType.en;
  }

  static pluralTypeIndex(locale, count) {
    return Lang.pluralTypes[Lang.pluralTypeName(locale)](count);
  }

  init(options = {}) {
    this.phrases = {};
    this.extend(options.phrases || {});
    this.locale = options.locale || 'en';
  }

  // initialize this.phrase using passed phrases
  // allowing nested objects
  extend(morePhrases, prefix) {
    Object.keys(morePhrases).forEach((key) => {
      const phrase = morePhrases[key];
      const prefixedKey = prefix ? `${prefix}.${key}` : key;

      // make sure the phrase structure is right
      invariant(
        typeof phrase === 'object' || typeof phrase === 'string',
        'Value of each key of phrase object passed to Lang.init() only accepts object or string type'
      );

      if (typeof phrase === 'object') {
        this.phrases[prefixedKey] = phrase;
        this.extend(phrase, prefixedKey);
      } else {
        this.phrases[prefixedKey] = phrase;
      }
    });
  }

  t(key, options = {}) {
    let phrase;
    let result;
    if (this.phrases[key]) {
      phrase = this.phrases[key];
    } else if (typeof options._ === 'string') {
      phrase = options._;
    } else {
      result = key;
    }

    if (typeof phrase === 'string') {
      result = this.transformPhrase(phrase, options);
    } else if (typeof phrase === 'object') {
      result = phrase;
    }
    return result;
  }

  transformPhrase(phrase, substitutions) {
    if (!(_isPlainObject(substitutions) || _isFinite(substitutions))) {
      return phrase;
    }

    let result = phrase;

    // allow number as a pluralization shortcut
    const options = typeof substitutions === 'number' ? { count: substitutions } : substitutions;

    // Interval plural. Can customize the interval to match
    if (options.interval_count !== undefined && result) {
      const intervals = result.split(Lang.intervalSeparator);

      let found;
      intervals.forEach((iv) => {
        if (found) {
          return;
        }

        const match = Lang.intervalRegex.exec(iv);
        if (match && Lang.intervalMatches(match[1], options.interval_count)) {
          // found = match[2];
          [, , found] = match;
        }
      });

      result = found || '';
    }

    // Select plural form: based on a phrase text that contains `n`
    // plural forms separated by `delimeter`, a `locale`, and a `substitutions.smart_count`,
    // choose the correct plural form. This is only done if `count` is set.
    if (options.count !== undefined && result) {
      const texts = result.split(Lang.delimeter);
      result = (texts[Lang.pluralTypeIndex(this.locale, options.count)] || texts[0]).trim();
    }

    // Interpolate: Creates a `RegExp` object for each interpolation placeholder.
    result = result.replace(Lang.tokenRegex, (expression, argument) => {
      if (options[argument] === undefined) {
        return expression;
      }
      // Ensure replacement value is escaped to prevent special $-prefixed regex replace tokens.
      return options[argument].replace(/\$/g, '$$');
    });

    return result;
  }

  static intervalMatches(interval, count) {
    if (interval.indexOf('-') > -1) {
      const p = interval.split('-');
      if (p[1] === 'inf') {
        const from = parseInt(p[0], 10);
        return count >= from;
      }
      const from = parseInt(p[0], 10);
      const to = parseInt(p[1], 10);
      return count >= from && count <= to;
    }
    const match = parseInt(interval, 10);
    return match === count;
  }
}

// there's only on Lang instance for entire app.
const lang = new Lang();
lang.init({
  phrases: __PHRASES__,
  locale: __LOCALE__,
});

export default lang;
