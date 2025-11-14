\
const QUESTIONS = ['/questions/level1.json','/questions/level2.json','/questions/level3.json'];

async function loadAll() {
  const data = [];
  for (const url of QUESTIONS) {
    const res = await fetch(url);
    const arr = await res.json();
    const level = url.split('/').pop().replace('.json','');
    arr.forEach((q,i)=> q._meta = {level, id: `${level}-${i+1}`});
    data.push(...arr);
  }
  return data;
}

function el(sel){return document.querySelector(sel)}
function elAll(sel){return Array.from(document.querySelectorAll(sel))}

async function boot(){
  const data = await loadAll();
  window.QDATA = data;
  const qContainer = el('#questions');
  const template = document.getElementById('q-template');

  function render(list){
    qContainer.innerHTML = '';
    for (const q of list) {
      const node = template.content.cloneNode(true);
      const article = node.querySelector('.question-card');
      node.querySelector('.q-level').textContent = q._meta.level.toUpperCase();
      node.querySelector('.q-id').textContent = q._meta.id;
      node.querySelector('.q-title').textContent = q.title;
      node.querySelector('.q-desc').textContent = q.description || '';
      if (q.sample) node.querySelector('.q-sample').innerHTML = '<strong>Sample:</strong> ' + q.sample;
      else node.querySelector('.q-sample').style.display = 'none';
      const codeEl = node.querySelector('.codeblock');
      codeEl.textContent = q.solution || '';
      const showBtn = node.querySelector('.show-sol');
      showBtn.addEventListener('click', () => {
        const sol = article.querySelector('.q-solution');
        const visible = !sol.hasAttribute('hidden');
        if (visible) {
          sol.setAttribute('hidden','');
          showBtn.textContent = 'Show Solution';
        } else {
          sol.removeAttribute('hidden');
          showBtn.textContent = 'Hide Solution';
          if (window.Prism) Prism.highlightElement(codeEl);
        }
      });
      node.querySelector('.copy-code').addEventListener('click', async ()=>{
        try {
          await navigator.clipboard.writeText(q.solution || '');
          alert('Code copied to clipboard');
        } catch(e){ alert('Copy failed'); }
      });
      qContainer.appendChild(node);
    }
  }

  render(data);

  elAll('.lvlbtn').forEach(b=>{
    b.addEventListener('click', ()=>{
      elAll('.lvlbtn').forEach(x=>x.classList.remove('active'));
      b.classList.add('active');
      const lvl = b.dataset.level;
      if (lvl === 'all') render(data);
      else render(data.filter(q=> q._meta.level === lvl));
    });
  });

  el('#levelFilter').addEventListener('change', (e)=>{
    const v = e.target.value;
    if (v==='all') render(data);
    else render(data.filter(q=> q._meta.level === v));
  });

  el('#search').addEventListener('input', (e)=>{
    const q = e.target.value.trim().toLowerCase();
    if (!q) { render(data); return; }
    const filtered = data.filter(item=>{
      return (item.title && item.title.toLowerCase().includes(q)) ||
             (item.description && item.description.toLowerCase().includes(q)) ||
             (item.solution && item.solution.toLowerCase().includes(q));
    });
    render(filtered);
  });

  const themeToggle = el('#themeToggle');
  const body = document.body;
  const saved = localStorage.getItem('theme');
  if (saved === 'dark') body.classList.add('dark');
  themeToggle.addEventListener('click', ()=>{
    body.classList.toggle('dark');
    localStorage.setItem('theme', body.classList.contains('dark') ? 'dark' : 'light');
    themeToggle.textContent = body.classList.contains('dark') ? '☀️' : '🌙';
  });
}

document.addEventListener('DOMContentLoaded', boot);
