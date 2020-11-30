/*
 * Provide overrides for the Formulate default library components
 */

type LibraryEntry = {
  classification: string;
  component: string;
}

const fi = 'JtFormulateInput';
const add = (n: string, c?: string): LibraryEntry => ({
  classification: n,
  component: fi + (c || (n[0].toUpperCase() + n.substr(1))),
});

export default {
  // === SINGLE LINE TEXT STYLE INPUTS WITHOUT MASKING
  ...[
    'text',
    'email',
    'password',
    'search',
    'tel',
    'url',
  ].reduce((lib, type) => ({ ...lib, [type]: add('text') }), {}),

  // === MULTI-LINE TEXT INPUTS
  textarea: add('textArea'),

  // === JADE TREE INPUTS
  jtDate: add('date'),

  // == JADE TREE CURRENCY INPUT
  jtMoney: {
    classification: 'money',
    component: 'JtFormulateInputMoney',
    slotProps: {
      component: [
        'currency',
        'format',
        'locale',
        'precision',
      ],
    },
  },

  // == JADE TREE SELECT
  jtSelect: {
    classification: 'select',
    component: 'JtFormulateInputSelect',
    slotProps: {
      component: [
        'getDisplayText',
        'itemComponent',
        'selectKeys',
      ],
    },
  },
};
