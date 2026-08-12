import './styles/tokens.css'
import './styles/base.css'
import './styles/components.css'
import './styles/sections.css'
import { BadgeCheck, BadgeEuro, createIcons, Database, Files, Monitor, Plug, Search } from 'lucide'

const tasks = [
  { id: 'publish-exhibition', category: 'website', label: 'Website', title: 'Publish an exhibition', price: 120, description: 'Text, images and dates turned into a published exhibition page.' },
  { id: 'opening-website', category: 'website', label: 'Website', title: 'Prepare for an opening', price: 220, description: 'Homepage, exhibition and artist pages refreshed and ready before opening.' },
  { id: 'artist-page', category: 'website', label: 'Website', title: 'Add an artist page', price: 90, description: 'Biography, works, images and basic metadata added to the gallery website.' },
  { id: 'update-artworks', category: 'website', label: 'Website', title: 'Update 10 artworks', price: 90, description: 'Update images, captions, availability or other artwork information.' },
  { id: 'fix-website-issue', category: 'website', label: 'Website', title: 'Fix a website issue', price: 90, description: 'Something looks wrong or stopped working? We investigate and fix one defined issue.' },
  { id: 'organise-database', category: 'database', label: 'Database', title: 'Organise your database', price: 150, description: 'Clean categories, fields and structure.' },
  { id: 'import-artworks', category: 'database', label: 'Database', title: 'Import 50 artworks', price: 220, description: 'Clean and import your spreadsheet or export.' },
  { id: 'clean-records', category: 'database', label: 'Database', title: 'Clean 50 artwork records', price: 180, description: 'Fix inconsistent artwork information.' },
  { id: 'artlogic-check', category: 'database', label: 'Database', title: 'Artlogic database check', price: 120, description: 'Find what needs cleaning or reorganising.' },
  { id: 'collector-pdf', category: 'sales-material', label: 'Sales material', title: 'Collector PDF', price: 80, description: 'A clean, gallery-ready PDF prepared from selected artworks.' },
  { id: 'viewing-room', category: 'sales-material', label: 'Sales material', title: 'Private viewing room', price: 120, description: 'Prepare and publish a private online artwork selection for a collector.' },
  { id: 'seo-check', category: 'visibility', label: 'Visibility', title: 'Artist SEO check', price: 120, description: 'Find the main issues.' },
  { id: 'fix-google', category: 'visibility', label: 'Visibility', title: 'Google indexing', price: 90, description: 'Get new pages discovered.' },
]

const grid = document.querySelector('#task-grid')
const summary = document.querySelector('#request-summary')
const modal = document.querySelector('#task-modal')
const invoiceDate = document.querySelector('#invoice-date')
const selected = new Set()
let activeFilter = 'all'
let previewedTask = null

if (invoiceDate) {
  invoiceDate.textContent = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date())
}

function renderTasks() {
  const visibleTasks = activeFilter === 'all' ? tasks : tasks.filter((task) => task.category === activeFilter)
  grid.innerHTML = visibleTasks.map((task) => `
    <article class="task-card" data-preview-id="${task.id}" tabindex="0" role="button" aria-label="Preview ${task.title}">
      <p class="task-category">${task.label}</p><h3>${task.title}</h3><p class="task-price">€${task.price}</p><p class="task-description">${task.description}</p>
      <button class="task-add ${selected.has(task.id) ? 'is-selected' : ''}" type="button" data-task-id="${task.id}" aria-pressed="${selected.has(task.id)}">${selected.has(task.id) ? 'Added' : 'Add task'}</button>
    </article>`).join('')
}

function updateSummary() {
  const selectedTasks = tasks.filter((task) => selected.has(task.id))
  const total = selectedTasks.reduce((sum, task) => sum + task.price, 0)
  const wasVisible = !summary.hidden
  const requestItems = document.querySelector('#request-items')
  document.querySelector('#task-count').textContent = `${selectedTasks.length} task${selectedTasks.length === 1 ? '' : 's'}`
  document.querySelector('#task-total').textContent = `€${total} estimated`
  document.querySelector('#request-total').textContent = `€${total}`
  requestItems.replaceChildren()
  selectedTasks.slice(0, 2).forEach((task) => {
    const item = document.createElement('div')
    item.className = 'request-summary__item'
    const title = document.createElement('span')
    const price = document.createElement('strong')
    title.textContent = task.title
    price.textContent = `€${task.price}`
    item.append(title, price)
    requestItems.append(item)
  })
  if (selectedTasks.length > 2) {
    const more = document.createElement('div')
    more.className = 'request-summary__item request-summary__item--more'
    const label = document.createElement('span')
    label.textContent = `+${selectedTasks.length - 2} more task${selectedTasks.length === 3 ? '' : 's'}`
    more.append(label, document.createElement('span'))
    requestItems.append(more)
  }
  document.querySelector('#request-tasks').href = `mailto:hello@vitreen.studio?subject=${encodeURIComponent('Vitreen task request')}&body=${encodeURIComponent(`Hello Vitreen,\n\nI would like to request:\n${selectedTasks.map((task) => `- ${task.title} (€${task.price})`).join('\n')}\n\nEstimated total: €${total}`)}`
  if (!selectedTasks.length) {
    summary.classList.remove('is-visible', 'is-updated')
    summary.hidden = true
  } else {
    summary.hidden = false
    if (!wasVisible) {
      requestAnimationFrame(() => summary.classList.add('is-visible'))
    } else {
      summary.classList.remove('is-updated')
      requestAnimationFrame(() => {
        summary.classList.add('is-updated')
        window.setTimeout(() => summary.classList.remove('is-updated'), 280)
      })
    }
  }
  updateInvoice(selectedTasks, total)
}

function updateInvoice(selectedTasks, total) {
  const invoiceItems = document.querySelector('#invoice-items')
  const displayedTasks = selectedTasks.length ? selectedTasks : [tasks[0]]
  const displayedTotal = selectedTasks.length ? total : tasks[0].price
  invoiceItems.innerHTML = displayedTasks.map((task) => `<div class="invoice-row invoice-row--item"><div><strong>${task.title}</strong><small>${selectedTasks.length ? task.label : 'Example task'}</small></div><span>1</span><span>€${task.price}</span><strong>€${task.price}</strong></div>`).join('')
  document.querySelector('#invoice-subtotal').textContent = `€${displayedTotal}`
  document.querySelector('#invoice-total').textContent = `€${displayedTotal}`
}

function previewMarkup(task) {
  if (task.category === 'website') return `<div class="preview-browser"><div class="preview-browser__bar"><i></i><i></i><i></i></div><div class="preview-site"><small>Gallery name</small><div class="preview-image"></div><h3>${task.title === 'Add an artist page' ? 'Artist name' : 'New exhibition'}</h3><p>Contemporary art, selected works and exhibition information.</p></div></div>`
  if (task.category === 'database') return `<div class="preview-table"><div class="preview-table__heading">Artwork records <span>Clean &amp; ready</span></div><div class="preview-row preview-row--head"><b>Artist</b><b>Title</b><b>Year</b><b>Status</b></div><div class="preview-row"><span>A. Martin</span><span>Untitled</span><span>2024</span><span>Available</span></div><div class="preview-row"><span>J. Smith</span><span>Blue Study</span><span>2023</span><span>Reserved</span></div><div class="preview-row"><span>L. Chen</span><span>Movement</span><span>2022</span><span>Available</span></div></div>`
  if (task.category === 'sales-material') return `<div class="preview-pdf"><div><small>Gallery name</small><h3>Selected works</h3><p>Private selection for a collector</p></div><div class="preview-pdf__art"></div><span>01 — 12</span></div>`
  return `<div class="preview-search"><small>Google</small><div class="preview-search__input">artist name gallery</div><p class="preview-result__url">galleryname.com › artists › artist-name</p><h3>Artist Name — Gallery Name</h3><p>Biography, selected works, exhibitions and available artworks.</p></div>`
}

function openPreview(task) {
  previewedTask = task
  document.querySelector('#modal-category').textContent = task.label
  document.querySelector('#modal-task-title').textContent = task.title
  document.querySelector('#modal-price').textContent = `€${task.price}`
  document.querySelector('#modal-description').textContent = task.description
  document.querySelector('#modal-preview').innerHTML = previewMarkup(task)
  document.querySelector('#modal-add').textContent = selected.has(task.id) ? 'Remove task' : 'Add task'
  modal.showModal()
}

document.querySelector('.task-filters').addEventListener('click', (event) => {
  const filter = event.target.closest('.filter')
  if (!filter) return
  activeFilter = filter.dataset.filter
  document.querySelectorAll('.filter').forEach((item) => item.classList.toggle('is-active', item === filter))
  renderTasks()
})
document.querySelector('.category-strip').addEventListener('click', (event) => {
  const link = event.target.closest('.category-link')
  if (!link) return
  activeFilter = link.dataset.category
  document.querySelectorAll('.filter').forEach((item) => item.classList.toggle('is-active', item.dataset.filter === activeFilter))
  renderTasks()
})
grid.addEventListener('click', (event) => {
  const button = event.target.closest('.task-add')
  if (!button) {
    const card = event.target.closest('.task-card')
    if (card) openPreview(tasks.find((task) => task.id === card.dataset.previewId))
    return
  }
  const { taskId } = button.dataset
  selected.has(taskId) ? selected.delete(taskId) : selected.add(taskId)
  renderTasks()
  updateSummary()
})
grid.addEventListener('keydown', (event) => {
  if (event.key !== 'Enter' && event.key !== ' ') return
  const card = event.target.closest('.task-card')
  if (!card) return
  event.preventDefault()
  openPreview(tasks.find((task) => task.id === card.dataset.previewId))
})
document.querySelector('.modal-close').addEventListener('click', () => modal.close())
document.querySelector('#modal-add').addEventListener('click', () => {
  selected.has(previewedTask.id) ? selected.delete(previewedTask.id) : selected.add(previewedTask.id)
  renderTasks()
  updateSummary()
  modal.close()
})
modal.addEventListener('click', (event) => { if (event.target === modal) modal.close() })

renderTasks()
updateSummary()
createIcons({ icons: { BadgeCheck, BadgeEuro, Database, Files, Monitor, Plug, Search } })

// Drag the estimate ticket down to collapse it to a peeking strip, or up to reopen it.
const dragZone = summary.querySelector('.request-summary__drag-zone')
if (dragZone) {
  const PEEK = 56
  let dragging = false
  let startY = 0
  let startOffset = 0
  let cardHeight = 0
  let moved = 0

  const setCollapsed = (collapsed) => summary.classList.toggle('is-collapsed', collapsed)

  dragZone.addEventListener('pointerdown', (event) => {
    dragging = true
    moved = 0
    startY = event.clientY
    cardHeight = summary.getBoundingClientRect().height
    startOffset = summary.classList.contains('is-collapsed') ? cardHeight - PEEK : 0
    summary.classList.add('is-dragging')
    dragZone.setPointerCapture(event.pointerId)
  })

  dragZone.addEventListener('pointermove', (event) => {
    if (!dragging) return
    const delta = event.clientY - startY
    moved = Math.abs(delta)
    const next = Math.min(Math.max(startOffset + delta, 0), cardHeight - PEEK)
    summary.style.transform = `translate(-50%, ${next}px)`
  })

  const endDrag = (event) => {
    if (!dragging) return
    dragging = false
    summary.classList.remove('is-dragging')
    summary.style.transform = ''
    if (moved < 6) {
      setCollapsed(!summary.classList.contains('is-collapsed'))
    } else {
      const delta = event.clientY - startY
      const finalOffset = Math.min(Math.max(startOffset + delta, 0), cardHeight - PEEK)
      setCollapsed(finalOffset > (cardHeight - PEEK) / 2)
    }
  }
  dragZone.addEventListener('pointerup', endDrag)
  dragZone.addEventListener('pointercancel', endDrag)
}
