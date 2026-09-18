export default function decorate(block) {
  const children = [];
  [...block.children].forEach((row) => {
    if (!row.children[1] || !row.children[0].textContent.trim()) return;
    const details = document.createElement('details');
    const summary = document.createElement('summary');
    summary.className = 'accordion-item-label';
    summary.append(...row.children[0].childNodes);
    const body = row.children[1];
    body.className = 'accordion-item-body';
    details.className = 'accordion-item';
    details.append(summary, body);
    children.push(details);
  });

  block.replaceChildren(...children);
}
