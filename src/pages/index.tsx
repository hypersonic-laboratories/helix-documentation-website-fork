// ----------------------------------------------------------------------------
// Root URL `/` redirect.
//
// The "real" homepage of the site is now a docs landing page at /docs/, so
// it inherits the docs sidebar (Start Here / Getting Started / Scripting /
// etc.) the way Kostas's prototype shows. The page lives at:
//
//   docs/learn-to-create.mdx  →  rendered at /docs/  (slug: /)
//
// This file just shunts visitors of `/` over there. Existing bookmarks of
// the bare domain still work; everything else stays the same.
// ----------------------------------------------------------------------------

import React from 'react';
import {Redirect} from '@docusaurus/router';

export default function Home(): React.ReactElement {
  return <Redirect to="/docs/" />;
}
