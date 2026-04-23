import React from 'react';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';

interface LanguageTabsProps {
  blueprint?: string;
  lua?: string;
  js?: string;
  bpTitle?: string;
  luaTitle?: string;
  jsTitle?: string;
}

export default function LanguageTabs({
  blueprint,
  lua,
  js,
  bpTitle,
  luaTitle,
  jsTitle,
}: LanguageTabsProps): React.ReactElement {
  return (
    <Tabs
      groupId="scripting-language"
      defaultValue="blueprint"
      values={[
        {label: 'Blueprint', value: 'blueprint'},
        {label: 'Lua', value: 'lua'},
        {label: 'JavaScript', value: 'js'},
      ]}
    >
      <TabItem value="blueprint">
        {bpTitle && <p><strong>{bpTitle}</strong></p>}
        {blueprint ? (
          <CodeBlock language="cpp" title="Blueprint (C++ equivalent)">
            {blueprint}
          </CodeBlock>
        ) : (
          <p><em>Blueprint node equivalent available in HELIX Studio.</em></p>
        )}
      </TabItem>
      <TabItem value="lua">
        {luaTitle && <p><strong>{luaTitle}</strong></p>}
        {lua ? (
          <CodeBlock language="lua">
            {lua}
          </CodeBlock>
        ) : (
          <p><em>Lua example coming soon.</em></p>
        )}
      </TabItem>
      <TabItem value="js">
        {jsTitle && <p><strong>{jsTitle}</strong></p>}
        {js ? (
          <CodeBlock language="javascript">
            {js}
          </CodeBlock>
        ) : (
          <p><em>JavaScript example coming soon.</em></p>
        )}
      </TabItem>
    </Tabs>
  );
}
