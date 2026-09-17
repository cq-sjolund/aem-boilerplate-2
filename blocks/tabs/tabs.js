let instanceCount = 0;

export default function decorate(block) {
  instanceCount += 1;
  const instanceId = instanceCount;
  const rows = [...block.children].filter((row) => row.children[1]);

  const tablist = document.createElement('div');
  tablist.className = 'tabs-list';
  tablist.setAttribute('role', 'tablist');

  const tabs = [];
  const panels = [];

  rows.forEach((row, index) => {
    const [labelCell, panelCell] = row.children;
    const tabId = `tabs-${instanceId}-${index}-tab`;
    const panelId = `tabs-${instanceId}-${index}-panel`;
    const active = index === 0;

    const tab = document.createElement('button');
    tab.type = 'button';
    tab.id = tabId;
    tab.className = 'tabs-tab';
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', panelId);
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
    tab.append(...labelCell.childNodes);
    tablist.append(tab);
    tabs.push(tab);

    panelCell.id = panelId;
    panelCell.className = 'tabs-panel';
    panelCell.setAttribute('role', 'tabpanel');
    panelCell.setAttribute('aria-labelledby', tabId);
    panelCell.hidden = !active;
    panels.push(panelCell);
  });

  function activateTab(index, { focus = true } = {}) {
    tabs.forEach((tab, i) => {
      const active = i === index;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      panels[i].hidden = !active;
    });
    if (focus) tabs[index].focus();
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateTab(index, { focus: false }));
    tab.addEventListener('keydown', (event) => {
      let newIndex;
      if (event.key === 'ArrowRight') newIndex = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') newIndex = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === 'Home') newIndex = 0;
      else if (event.key === 'End') newIndex = tabs.length - 1;
      else return;
      event.preventDefault();
      activateTab(newIndex);
    });
  });

  block.replaceChildren(tablist, ...panels);
}
