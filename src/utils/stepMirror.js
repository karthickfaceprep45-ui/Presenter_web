/**
 * Generic DOM + state mirroring utilities for arbitrary Vue step components.
 * Enables Mentor-to-Student real-time mirroring without modifying step files.
 */

function removeScriptsAndComments(rootEl) {
  const walker = document.createTreeWalker(
    rootEl,
    NodeFilter.SHOW_COMMENT | NodeFilter.SHOW_ELEMENT
  )

  const toRemove = []
  let node = walker.nextNode()
  while (node) {
    if (
      node.nodeType === Node.COMMENT_NODE ||
      (node.nodeType === Node.ELEMENT_NODE && node.tagName.toLowerCase() === 'script')
    ) {
      toRemove.push(node)
    }
    node = walker.nextNode()
  }

  for (const target of toRemove) {
    target.parentNode?.removeChild(target)
  }
}

function collectFormStates(containerEl) {
  const fields = containerEl.querySelectorAll('input, textarea, select')
  if (fields.length === 0) return null

  return Array.from(fields).map((el) => {
    const tag = el.tagName
    if (tag === 'SELECT') {
      const state = { k: 's', i: el.selectedIndex }
      if (el.multiple) {
        state.v = Array.from(el.options)
          .filter((opt) => opt.selected)
          .map((opt) => opt.value)
      }
      return state
    }

    if (tag === 'TEXTAREA') {
      return { k: 't', v: el.value }
    }

    const inputType = (el.type || '').toLowerCase()
    if (inputType === 'checkbox' || inputType === 'radio') {
      return {
        k: 'c',
        c: el.checked,
        n: el.indeterminate
      }
    }

    return { k: 'i', v: el.value }
  })
}

function collectScrollStates(containerEl) {
  const rootScroll =
    containerEl.scrollTop || containerEl.scrollLeft
      ? [Math.round(containerEl.scrollTop), Math.round(containerEl.scrollLeft)]
      : null

  const scrolls = []
  const elements = containerEl.querySelectorAll('*')
  elements.forEach((el, idx) => {
    if (el.scrollTop || el.scrollLeft) {
      scrolls.push([idx, Math.round(el.scrollTop), Math.round(el.scrollLeft)])
    }
  })

  return {
    rootScroll,
    scrolls: scrolls.length > 0 ? scrolls : null
  }
}

function collectCanvasStates(containerEl) {
  const canvases = containerEl.querySelectorAll('canvas')
  if (canvases.length === 0) return null

  return Array.from(canvases).map((canvas) => {
    try {
      return canvas.toDataURL('image/png')
    } catch (_) {
      return null
    }
  })
}

export function captureStepSnapshot(containerEl, stepIndex) {
  if (!containerEl) return null

  const clone = containerEl.cloneNode(true)
  removeScriptsAndComments(clone)
  const html = clone.innerHTML

  const forms = collectFormStates(containerEl)
  const { rootScroll, scrolls } = collectScrollStates(containerEl)
  const canvases = collectCanvasStates(containerEl)

  const snapshot = {
    stepIndex,
    html
  }

  if (forms) snapshot.forms = forms
  if (rootScroll) snapshot.rootScroll = rootScroll
  if (scrolls) snapshot.scrolls = scrolls
  if (canvases) snapshot.canvases = canvases

  const signature = JSON.stringify(snapshot)
  return {
    snapshot,
    signature
  }
}

function isCompatibleNode(existingNode, sourceNode) {
  if (!existingNode || !sourceNode) return false
  if (existingNode.nodeType !== sourceNode.nodeType) return false

  if (existingNode.nodeType === Node.ELEMENT_NODE) {
    if (existingNode.dataset?.mirrorPlaceholder === 'true') return false
    if (existingNode.tagName !== sourceNode.tagName) return false
    if (existingNode.namespaceURI !== sourceNode.namespaceURI) return false
    if (sourceNode.id && existingNode.id && existingNode.id !== sourceNode.id) return false
  }

  return true
}

function syncAttributes(targetEl, sourceEl) {
  const targetAttrs = Array.from(targetEl.attributes)
  for (const attr of targetAttrs) {
    if (attr.namespaceURI) {
      if (!sourceEl.hasAttributeNS(attr.namespaceURI, attr.localName)) {
        targetEl.removeAttributeNS(attr.namespaceURI, attr.localName)
      }
    } else if (!sourceEl.hasAttribute(attr.name)) {
      targetEl.removeAttribute(attr.name)
    }
  }

  const sourceAttrs = Array.from(sourceEl.attributes)
  for (const attr of sourceAttrs) {
    if (attr.namespaceURI) {
      if (targetEl.getAttributeNS(attr.namespaceURI, attr.localName) !== attr.value) {
        targetEl.setAttributeNS(attr.namespaceURI, attr.name, attr.value)
      }
    } else if (targetEl.getAttribute(attr.name) !== attr.value) {
      targetEl.setAttribute(attr.name, attr.value)
    }
  }
}

function morphChildren(targetParent, sourceParent) {
  const sourceChildren = Array.from(sourceParent.childNodes)

  for (let i = 0; i < sourceChildren.length; i++) {
    const sourceChild = sourceChildren[i]
    const currentTarget = targetParent.childNodes[i]

    if (!currentTarget) {
      targetParent.appendChild(document.importNode(sourceChild, true))
      continue
    }

    if (!isCompatibleNode(currentTarget, sourceChild)) {
      const nextTarget = targetParent.childNodes[i + 1]
      const nextSource = sourceChildren[i + 1]

      if (nextTarget && isCompatibleNode(nextTarget, sourceChild)) {
        targetParent.removeChild(currentTarget)
      } else if (nextSource && isCompatibleNode(currentTarget, nextSource)) {
        targetParent.insertBefore(document.importNode(sourceChild, true), currentTarget)
        continue
      } else {
        targetParent.replaceChild(document.importNode(sourceChild, true), currentTarget)
        continue
      }
    }

    const activeTarget = targetParent.childNodes[i]
    if (!activeTarget) continue

    if (
      activeTarget.nodeType === Node.TEXT_NODE ||
      activeTarget.nodeType === Node.COMMENT_NODE
    ) {
      if (activeTarget.nodeValue !== sourceChild.nodeValue) {
        activeTarget.nodeValue = sourceChild.nodeValue
      }
    } else if (activeTarget.nodeType === Node.ELEMENT_NODE) {
      syncAttributes(activeTarget, sourceChild)
      morphChildren(activeTarget, sourceChild)
    }
  }

  while (targetParent.childNodes.length > sourceChildren.length) {
    targetParent.removeChild(targetParent.lastChild)
  }
}

function applyFormStates(mirrorEl, forms) {
  if (!Array.isArray(forms) || forms.length === 0) return

  const fields = mirrorEl.querySelectorAll('input, textarea, select')
  fields.forEach((el, idx) => {
    const state = forms[idx]
    if (!state) return

    if (state.k === 's' && el.tagName === 'SELECT') {
      if (Array.isArray(state.v) && el.multiple) {
        const selectedSet = new Set(state.v)
        Array.from(el.options).forEach((opt) => {
          opt.selected = selectedSet.has(opt.value)
        })
      } else if (typeof state.i === 'number' && el.selectedIndex !== state.i) {
        el.selectedIndex = state.i
      }
      return
    }

    if (state.k === 't' && el.tagName === 'TEXTAREA') {
      const val = state.v ?? ''
      if (el.value !== val) el.value = val
      return
    }

    if (state.k === 'c') {
      el.checked = Boolean(state.c)
      el.indeterminate = Boolean(state.n)
      return
    }

    if (state.k === 'i') {
      const val = state.v ?? ''
      if (el.value !== val) el.value = val
    }
  })
}

function applyScrollStates(mirrorEl, rootScroll, scrolls) {
  const [rootTop, rootLeft] = Array.isArray(rootScroll) ? rootScroll : [0, 0]
  if (mirrorEl.scrollTop !== rootTop) mirrorEl.scrollTop = rootTop
  if (mirrorEl.scrollLeft !== rootLeft) mirrorEl.scrollLeft = rootLeft

  if (!Array.isArray(scrolls) || scrolls.length === 0) return

  const elements = mirrorEl.querySelectorAll('*')
  for (const entry of scrolls) {
    if (!Array.isArray(entry)) continue
    const [idx, top, left] = entry
    const target = elements[idx]
    if (!target) continue
    if (target.scrollTop !== top) target.scrollTop = top
    if (target.scrollLeft !== left) target.scrollLeft = left
  }
}

let canvasPaintToken = 0

function applyCanvasStates(mirrorEl, canvases) {
  if (!Array.isArray(canvases) || canvases.length === 0) return

  const token = String(++canvasPaintToken)
  const targetCanvases = mirrorEl.querySelectorAll('canvas')

  targetCanvases.forEach((canvas, idx) => {
    const dataUrl = canvases[idx]
    if (!dataUrl) return

    canvas.dataset.mirrorPaintToken = token
    const img = new Image()
    img.onload = () => {
      if (canvas.dataset.mirrorPaintToken !== token) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    }
    img.src = dataUrl
  })
}

export function applyStepSnapshot(mirrorEl, snapshot) {
  if (!mirrorEl || !snapshot || typeof snapshot.html !== 'string') return

  const tpl = document.createElement('template')
  tpl.innerHTML = snapshot.html
  removeScriptsAndComments(tpl.content)

  morphChildren(mirrorEl, tpl.content)
  applyFormStates(mirrorEl, snapshot.forms)
  applyScrollStates(mirrorEl, snapshot.rootScroll, snapshot.scrolls)
  applyCanvasStates(mirrorEl, snapshot.canvases)
}

export function showMirrorWaitingPlaceholder(mirrorEl, text = 'Syncing live view...') {
  if (!mirrorEl) return
  mirrorEl.innerHTML = ''
  const placeholder = document.createElement('div')
  placeholder.dataset.mirrorPlaceholder = 'true'
  placeholder.className = 'text-xs text-gray-400 font-medium'
  placeholder.textContent = text
  mirrorEl.appendChild(placeholder)
}

