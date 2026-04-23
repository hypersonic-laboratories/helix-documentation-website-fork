import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebarsApi: SidebarsConfig = {
  apiSidebar: [
    {
      type: 'category',
      label: 'Classes',
      collapsed: false,
      items: [
        'classes/actor',
        'classes/character',
        'classes/vehicle',
        'classes/webui',
        'classes/events',
        'classes/timer',
        'classes/input',
        'classes/database',
        'classes/light',
        'classes/trigger',
      ],
    },
    {
      type: 'category',
      label: 'Enums',
      collapsed: true,
      items: [
        'enums/index',
      ],
    },
    {
      type: 'category',
      label: 'Global Functions',
      collapsed: true,
      items: [
        'global-functions/index',
      ],
    },
  ],
};

export default sidebarsApi;
