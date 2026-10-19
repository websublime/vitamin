import './components/line-button.ts';
import './components/line-icon.ts';
import './components/line-separator.ts';
import './components/line-stack.ts';

/**
 * Hand-written `line-*` markup for the final state of the `showcase` and `slots` fixtures. The slot and layout checks
 * compare each candidate's output against this page.
 */
const MARKUP: Record<string, string> = {
  showcase: `
<line-stack data-a2ui-id="root" direction="column" align="stretch">
  <h2 data-a2ui-id="title">Inbox</h2>
  <line-stack data-a2ui-id="profile" direction="row" align="center">
    <line-icon data-a2ui-id="mailIcon" name="mail"></line-icon>
    <p data-a2ui-id="name" style="flex-grow: 1">Grace</p>
    <img data-a2ui-id="avatar" src="/pages/avatar.svg" alt="Avatar of the user" style="object-fit: cover" />
  </line-stack>
  <line-separator data-a2ui-id="rule" orientation="horizontal"></line-separator>
  <line-stack data-a2ui-id="items" role="list">
    <line-stack data-a2ui-id="item" role="listitem" direction="row" align="center">
      <line-icon data-a2ui-id="itemIcon" name="check"></line-icon><p data-a2ui-id="itemText">Draft saved</p>
    </line-stack>
    <line-stack data-a2ui-id="item" role="listitem" direction="row" align="center">
      <line-icon data-a2ui-id="itemIcon" name="check"></line-icon><p data-a2ui-id="itemText">Reply sent</p>
    </line-stack>
  </line-stack>
  <line-stack data-a2ui-id="actions" direction="row" justify="spaceBetween">
    <line-button data-a2ui-id="send" variant="primary"><p data-a2ui-id="sendLabel">Send</p></line-button>
    <line-separator data-a2ui-id="split" orientation="vertical"></line-separator>
    <line-button data-a2ui-id="close"><line-icon data-a2ui-id="closeIcon" name="close"></line-icon></line-button>
  </line-stack>
  <line-button data-a2ui-id="wide"><p data-a2ui-id="wideLabel">Full width</p></line-button>
</line-stack>`,
  slots: `
<line-stack data-a2ui-id="root" direction="column" align="start">
  <line-button data-a2ui-id="send" variant="primary"
    ><line-icon data-a2ui-id="sendIcon" slot="prefix" name="send"></line-icon>Send</line-button
  >
  <line-separator data-a2ui-id="sep"></line-separator>
  <line-button data-a2ui-id="next">Continue</line-button>
</line-stack>`,
};

const name = new URLSearchParams(location.search).get('fixture') ?? 'showcase';
const host = document.querySelector('#host');
if (host) host.innerHTML = MARKUP[name] ?? '';
const closeIcon = document.querySelector('[data-a2ui-id="closeIcon"]');
if (closeIcon) Object.assign(closeIcon, { label: 'Close' });
await Promise.all(
  ['line-button', 'line-icon', 'line-separator', 'line-stack'].map((tag) => customElements.whenDefined(tag)),
);
document.body.dataset.ready = 'true';
