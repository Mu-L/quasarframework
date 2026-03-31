const google = key => ({ type: 'google', key })
const file = (path, pattern) => ({ type: 'file', path, pattern })
const packageSpec = name => ({ type: 'packageSpec', name })

const versionSources = {
  robotoFont: google('roboto-font'),
  robotoFontLatinExt: google('roboto-font-latin-ext'),
  materialIcons: google('material-icons'),
  materialIconsOutlined: google('material-icons-outlined'),
  materialIconsRound: google('material-icons-round'),
  materialIconsSharp: google('material-icons-sharp'),
  materialSymbolsOutlined: google('material-symbols-outlined'),
  materialSymbolsRounded: google('material-symbols-rounded'),
  materialSymbolsSharp: google('material-symbols-sharp'),
  mdiV7: file('mdi-v7/mdi-v7.css', /MaterialDesignIcons\.com v([0-9.]+)/),
  mdiV6: file('mdi-v6/mdi-v6.css', /MaterialDesignIcons\.com v([0-9.]+)/),
  mdiV5: file('mdi-v5/mdi-v5.css', /MaterialDesignIcons\.com v([0-9.]+)/),
  mdiV4: file('mdi-v4/mdi-v4.css', /MaterialDesignIcons\.com v([0-9.]+)/),
  mdiV3: file('mdi-v3/mdi-v3.css', /MaterialDesignIcons\.com\s+([0-9.]+)/),
  fontawesomeV7: file('fontawesome-v7/index.js', /Fontawesome Free v([0-9.]+)/),
  fontawesomeV6: file(
    'fontawesome-v6/fontawesome-v6.css',
    /Font Awesome Free ([0-9.]+) by/
  ),
  fontawesomeV5: file(
    'fontawesome-v5/fontawesome-v5.css',
    /Font Awesome Free ([0-9.]+) by/
  ),
  ioniconsV8: file('ionicons-v8/index.js', /Ionicons v([0-9.]+)/),
  ioniconsV7: file('ionicons-v7/index.js', /Ionicons v([0-9.]+)/),
  ioniconsV6: file('ionicons-v6/index.js', /Ionicons v([0-9.]+)/),
  ioniconsV5: file('ionicons-v5/index.js', /Ionicons v([0-9.]+)/),
  ioniconsV4: file('ionicons-v4/index.js', /Ionicons v([0-9.]+)/),
  evaIcons: file('eva-icons/eva-icons.css', /Eva Icons v([0-9.]+)/),
  themify: file('themify/themify.css', /Themify Icons v([0-9.]+)/),
  lineAwesome: file('line-awesome/line-awesome.css', /Line Awesome v([0-9.]+)/),
  bootstrapIcons: file(
    'bootstrap-icons/bootstrap-icons.css',
    /Bootstrap Icons v([0-9.]+)/
  ),
  animate: packageSpec('animate.css')
}

module.exports.webfontRows = [
  {
    vendor: 'Roboto Font',
    versionSource: versionSources.robotoFont,
    extrasName: '`roboto-font`',
    description: 'Recommended font along Material theme',
    notes: '',
    license: '[License](roboto-font/LICENSE)'
  },
  {
    vendor: 'Roboto Font Latin Extended',
    versionSource: versionSources.robotoFontLatinExt,
    extrasName: '`roboto-font-latin-ext`',
    description: 'Recommended font along Material theme',
    notes: '',
    license: '[License](roboto-font-latin-ext/LICENSE)'
  },
  {
    vendor:
      '[Material Icons](https://material.io/tools/icons/?style=baseline) (Google)',
    versionSource: versionSources.materialIcons,
    extrasName: '`material-icons`',
    description: 'Material icons font',
    notes: 'Requires: @quasar/extras 1.2+',
    license: '[License](material-icons/LICENSE)'
  },
  {
    vendor:
      '[Material Icons Outlined](https://material.io/tools/icons/?style=outline)',
    versionSource: versionSources.materialIconsOutlined,
    extrasName: '`material-icons-outlined`',
    description: 'Material icons outlined font',
    notes: 'Requires: @quasar/extras 1.2+',
    license: '[License](material-icons-outlined/LICENSE)'
  },
  {
    vendor:
      '[Material Icons Round](https://material.io/tools/icons/?style=round)',
    versionSource: versionSources.materialIconsRound,
    extrasName: '`material-icons-round`',
    description: 'Material icons round font',
    notes: 'Requires: @quasar/extras 1.2+',
    license: '[License](material-icons-round/LICENSE)'
  },
  {
    vendor:
      '[Material Icons Sharp](https://material.io/tools/icons/?style=sharp)',
    versionSource: versionSources.materialIconsSharp,
    extrasName: '`material-icons-sharp`',
    description: 'Material icons sharp font',
    notes: 'Requires: @quasar/extras 1.2+',
    license: '[License](material-icons-sharp/LICENSE)'
  },
  {
    vendor:
      '[Material Symbols Outlined](https://fonts.google.com/icons?icon.style=Outlined)',
    versionSource: versionSources.materialSymbolsOutlined,
    extrasName: '`material-symbols-outlined`',
    description: 'Material symbols outlined font',
    notes: 'Requires: @quasar/extras 1.14+',
    license: '[License](material-symbols-outlined/LICENSE)'
  },
  {
    vendor:
      '[Material Symbols Rounded](https://fonts.google.com/icons?icon.style=Rounded)',
    versionSource: versionSources.materialSymbolsRounded,
    extrasName: '`material-symbols-rounded`',
    description: 'Material symbols rounded font',
    notes: 'Requires: @quasar/extras 1.14+',
    license: '[License](material-symbols-rounded/LICENSE)'
  },
  {
    vendor:
      '[Material Symbols Sharp](https://fonts.google.com/icons?icon.style=Sharp)',
    versionSource: versionSources.materialSymbolsSharp,
    extrasName: '`material-symbols-sharp`',
    description: 'Material symbols sharp font',
    notes: 'Requires: @quasar/extras 1.14+',
    license: '[License](material-symbols-sharp/LICENSE)'
  },
  {
    vendor:
      '[MDI v7](https://materialdesignicons.com/) (Material Design Icons)',
    versionSource: versionSources.mdiV7,
    extrasName: '`mdi-v7`',
    description: 'Extended Material Design icons font',
    notes: 'Requires: @quasar/extras 1.15+',
    license: '[License](mdi-v7/LICENSE)'
  },
  {
    vendor: 'MDI v6 (Material Design Icons)',
    versionSource: versionSources.mdiV6,
    extrasName: '`mdi-v6`',
    description: 'Extended Material Design icons font',
    notes: '',
    license: '[License](mdi-v6/LICENSE)'
  },
  {
    vendor: 'MDI v5 (Material Design Icons)',
    versionSource: versionSources.mdiV5,
    extrasName: '`mdi-v5`',
    description: 'Extended Material Design icons font',
    notes: '',
    license: '[License](mdi-v5/LICENSE)'
  },
  {
    vendor: 'MDI v4 (Material Design Icons)',
    versionSource: versionSources.mdiV4,
    extrasName: '`mdi-v4`',
    description: 'Extended Material Design icons font',
    notes: '',
    license: '[License](mdi-v4/license.md)'
  },
  {
    vendor: 'MDI v3 (Material Design Icons)',
    versionSource: versionSources.mdiV3,
    extrasName: '`mdi-v3`',
    description: 'Extended Material Design icons font',
    notes: '',
    license: '[License](mdi-v3/LICENSE)'
  },
  {
    vendor: '[Font Awesome v7](https://fontawesome.com/icons)',
    versionSource: versionSources.fontawesomeV7,
    extrasName: '`fontawesome-v7`',
    description: 'Fontawesome icons font',
    notes: 'Requires: @quasar/extras 1.18+',
    license: '[License](fontawesome-v7/LICENSE.txt)'
  },
  {
    vendor: 'Font Awesome v6',
    versionSource: versionSources.fontawesomeV6,
    extrasName: '`fontawesome-v6`',
    description: 'Fontawesome icons font',
    notes: 'Requires: @quasar/extras 1.13+',
    license: '[License](fontawesome-v6/LICENSE.txt)'
  },
  {
    vendor: 'Font Awesome v5',
    versionSource: versionSources.fontawesomeV5,
    extrasName: '`fontawesome-v5`',
    description: 'Fontawesome icons font',
    notes: '',
    license: '[License](fontawesome-v5/LICENSE.txt)'
  },
  {
    vendor: '[Ionicons](https://ionicons.com/v4)',
    versionSource: versionSources.ioniconsV4,
    extrasName: '`ionicons-v4`',
    description: 'Ionicons font',
    notes: '',
    license: '[License](ionicons-v4/LICENSE)'
  },
  {
    vendor: '[Eva Icons](https://akveo.github.io/eva-icons)',
    versionSource: versionSources.evaIcons,
    extrasName: '`eva-icons`',
    description: 'Eva Icons font',
    notes: '',
    license: '[License](eva-icons/LICENSE)'
  },
  {
    vendor: '[Themify Icons](https://themify.me/themify-icons)',
    versionSource: versionSources.themify,
    extrasName: '`themify`',
    description: 'Themify Icons font',
    notes: '',
    license: '[License](themify/LICENSE)'
  },
  {
    vendor: '[Line Awesome](https://icons8.com/line-awesome)',
    versionSource: versionSources.lineAwesome,
    extrasName: '`line-awesome`',
    description: 'Line Awesome font',
    notes: 'Requires: @quasar/extras 1.5+',
    license: '[License](line-awesome/LICENSE.md)'
  },
  {
    vendor: '[Bootstrap Icons](https://icons.getbootstrap.com/)',
    versionSource: versionSources.bootstrapIcons,
    extrasName: '`bootstrap-icons`',
    description: 'Bootstrap Icons font',
    notes: 'Requires: @quasar/extras 1.10+',
    license: '[License](bootstrap-icons/LICENSE)'
  },
  {
    vendor: '[Animate.css](https://animate.style/)',
    versionSource: versionSources.animate,
    extrasName: 'Use `animations` prop',
    description: 'Bundle of animations you can use in your website/app',
    notes: '',
    license: '[License](animate/LICENSE)'
  }
]

module.exports.svgRows = [
  {
    vendor:
      '[Material Icons](https://material.io/tools/icons/?style=baseline) (Google)',
    versionSource: versionSources.materialIcons,
    iconSetName: '`svg-material-icons`',
    importFrom: '`@quasar/extras/material-icons`',
    notes: '',
    license: '[License](material-icons/LICENSE)'
  },
  {
    vendor:
      '[Material Icons Outlined](https://material.io/tools/icons/?style=outlined) (Google)',
    versionSource: versionSources.materialIconsOutlined,
    iconSetName: '`svg-material-icons-outlined`',
    importFrom: '`@quasar/extras/material-icons-outlined`',
    notes: 'Requires: @quasar/extras 1.9+',
    license: '[License](material-icons-outlined/LICENSE)'
  },
  {
    vendor:
      '[Material Icons Round](https://material.io/tools/icons/?style=round) (Google)',
    versionSource: versionSources.materialIconsRound,
    iconSetName: '`svg-material-icons-round`',
    importFrom: '`@quasar/extras/material-icons-round`',
    notes: 'Requires: @quasar/extras 1.9+',
    license: '[License](material-icons-round/LICENSE)'
  },
  {
    vendor:
      '[Material Icons Sharp](https://material.io/tools/icons/?style=sharp) (Google)',
    versionSource: versionSources.materialIconsSharp,
    iconSetName: '`svg-material-icons-sharp`',
    importFrom: '`@quasar/extras/material-icons-sharp`',
    notes: 'Requires: @quasar/extras 1.9+',
    license: '[License](material-icons-sharp/LICENSE)'
  },
  {
    vendor:
      '[Material Symbols Outlined](https://fonts.google.com/icons?icon.style=Outlined) (Google)',
    versionSource: versionSources.materialSymbolsOutlined,
    iconSetName: '`svg-material-symbols-outlined`',
    importFrom: '`@quasar/extras/material-symbols-outlined`',
    notes: 'Requires: @quasar/extras 1.14+',
    license: '[License](material-symbols-outlined/LICENSE)'
  },
  {
    vendor:
      '[Material Symbols Rounded](https://fonts.google.com/icons?icon.style=Rounded) (Google)',
    versionSource: versionSources.materialSymbolsRounded,
    iconSetName: '`svg-material-symbols-rounded`',
    importFrom: '`@quasar/extras/material-symbols-rounded`',
    notes: 'Requires: @quasar/extras 1.14+',
    license: '[License](material-symbols-rounded/LICENSE)'
  },
  {
    vendor:
      '[Material Symbols Sharp](https://fonts.google.com/icons?icon.style=Sharp) (Google)',
    versionSource: versionSources.materialSymbolsSharp,
    iconSetName: '`svg-material-symbols-sharp`',
    importFrom: '`@quasar/extras/material-symbols-sharp`',
    notes: 'Requires: @quasar/extras 1.14+',
    license: '[License](material-symbols-sharp/LICENSE)'
  },
  {
    vendor:
      '[MDI v7](https://materialdesignicons.com/) (Material Design Icons)',
    versionSource: versionSources.mdiV7,
    iconSetName: '`svg-mdi-v7`',
    importFrom: '`@quasar/extras/mdi-v7`',
    notes: '',
    license: '[License](mdi-v7/LICENSE)'
  },
  {
    vendor: 'MDI v6 (Material Design Icons)',
    versionSource: versionSources.mdiV6,
    iconSetName: '`svg-mdi-v6`',
    importFrom: '`@quasar/extras/mdi-v6`',
    notes: '',
    license: '[License](mdi-v6/LICENSE)'
  },
  {
    vendor: 'MDI v5 (Material Design Icons)',
    versionSource: versionSources.mdiV5,
    iconSetName: '`svg-mdi-v5`',
    importFrom: '`@quasar/extras/mdi-v5`',
    notes: '',
    license: '[License](mdi-v5/LICENSE)'
  },
  {
    vendor: 'MDI v4 (Material Design Icons)',
    versionSource: versionSources.mdiV4,
    iconSetName: '`svg-mdi-v4`',
    importFrom: '`@quasar/extras/mdi-v4`',
    notes: '',
    license: '[License](mdi-v4/license.md)'
  },
  {
    vendor: '[Font Awesome v7](https://fontawesome.com/icons)',
    versionSource: versionSources.fontawesomeV7,
    iconSetName: '`svg-fontawesome-v7`',
    importFrom: '`@quasar/extras/fontawesome-v7`',
    notes: 'Requires: @quasar/extras 1.17+',
    license: '[License](fontawesome-v7/LICENSE.txt)'
  },
  {
    vendor: 'Font Awesome v6',
    versionSource: versionSources.fontawesomeV6,
    iconSetName: '`svg-fontawesome-v6`',
    importFrom: '`@quasar/extras/fontawesome-v6`',
    notes: 'Requires: @quasar/extras 1.13+',
    license: '[License](fontawesome-v6/LICENSE.txt)'
  },
  {
    vendor: 'Font Awesome v5',
    versionSource: versionSources.fontawesomeV5,
    iconSetName: '`svg-fontawesome-v5`',
    importFrom: '`@quasar/extras/fontawesome-v5`',
    notes: '',
    license: '[License](fontawesome-v5/LICENSE.txt)'
  },
  {
    vendor: '[Ionicons v8](https://ionicons.com/)',
    versionSource: versionSources.ioniconsV8,
    iconSetName: '`svg-ionicons-v8`',
    importFrom: '`@quasar/extras/ionicons-v8`',
    notes: 'Requires: @quasar/extras 1.18+',
    license: '[Icon License](ionicons-v8/LICENSE)'
  },
  {
    vendor: 'Ionicons v7',
    versionSource: versionSources.ioniconsV7,
    iconSetName: '`svg-ionicons-v7`',
    importFrom: '`@quasar/extras/ionicons-v7`',
    notes: 'Requires: @quasar/extras 1.16+',
    license: '[Icon License](ionicons-v7/LICENSE)'
  },
  {
    vendor: 'Ionicons v6',
    versionSource: versionSources.ioniconsV6,
    iconSetName: '`svg-ionicons-v6`',
    importFrom: '`@quasar/extras/ionicons-v6`',
    notes: 'Requires: @quasar/extras 1.12+',
    license: '[Icon License](ionicons-v6/LICENSE)'
  },
  {
    vendor: 'Ionicons v5',
    versionSource: versionSources.ioniconsV5,
    iconSetName: '`svg-ionicons-v5`',
    importFrom: '`@quasar/extras/ionicons-v5`',
    notes: 'Requires: @quasar/extras 1.7+',
    license: '[Icon License](ionicons-v5/LICENSE)'
  },
  {
    vendor: 'Ionicons v4',
    versionSource: versionSources.ioniconsV4,
    iconSetName: '`svg-ionicons-v4`',
    importFrom: '`@quasar/extras/ionicons-v4`',
    notes: 'No icon font (woof) files for Ionicons since v4.6.3',
    license: '[Icon License](ionicons-v4/LICENSE)'
  },
  {
    vendor: '[Eva Icons](https://akveo.github.io/eva-icons)',
    versionSource: versionSources.evaIcons,
    iconSetName: '`svg-eva-icons`',
    importFrom: '`@quasar/extras/eva-icons`',
    notes: '',
    license: '[License](eva-icons/LICENSE)'
  },
  {
    vendor: '[Themify Icons](https://themify.me/themify-icons)',
    versionSource: versionSources.themify,
    iconSetName: '`svg-themify`',
    importFrom: '`@quasar/extras/themify`',
    notes: '',
    license: '[License](themify/LICENSE)'
  },
  {
    vendor: '[Line Awesome](https://icons8.com/line-awesome)',
    versionSource: versionSources.lineAwesome,
    iconSetName: '`svg-line-awesome`',
    importFrom: '`@quasar/extras/line-awesome`',
    notes: 'Requires: @quasar/extras 1.5+',
    license: '[License](line-awesome/LICENSE.md)'
  },
  {
    vendor: '[Bootstrap Icons](https://icons.getbootstrap.com/)',
    versionSource: versionSources.bootstrapIcons,
    iconSetName: '`svg-bootstrap-icons`',
    importFrom: '`@quasar/extras/bootstrap-icons`',
    notes: 'Requires: @quasar/extras 1.10+',
    license: '[License](bootstrap-icons/LICENSE)'
  }
]
