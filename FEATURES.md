# Prompt Drawer - Feature Overview

## 🎨 Visual Design

The extension features a modern, expressive design with:
- **Sapphire Blue gradient background** (inspired by Subaru Crosstrek's iconic color!)
- **Smooth animations** for opening/closing and interactions
- **Draggable interface** - move it anywhere on your screen
- **Glass morphism effects** with subtle transparency
- **Rounded corners** and soft shadows for a polished look

## 📋 Main Components

### 1. Floating Drawer Panel
- Beautiful gradient purple header
- Drag handle (dots icon) for repositioning
- Close button (×) with smooth rotation on hover
- Compact 340px width that doesn't obstruct content

### 2. Category Filters
Six filter buttons in a horizontal row:
- **All** - Shows everything
- **Mood** - Tone and style prompts
- **Role** - Role-playing instructions
- **Brevity** - Conciseness modifiers
- **Format** - Output format requests
- **Meta** - Meta-instructions about reasoning

Active filter is highlighted in white, others have subtle transparency.

### 3. Snippets Section
- Scrollable list of clickable snippet buttons
- Each snippet shows its usage count in a badge
- White buttons with hover effects (lift and shadow)
- Automatically sorted by usage (most used on top)
- Smooth scroll with custom styled scrollbar

### 4. Saved Prompts Dropdown
- Elegant dropdown selector
- Shows preview of each prompt with usage count
- Select any prompt to insert it immediately
- Separated from snippets by a subtle divider line

### 5. Settings Button
- Gear icon (⚙️) at the bottom
- Opens full configuration page
- Subtle hover animation

## ⚙️ Settings/Options Page

A full-featured management interface with:

### Layout
- Large gradient header matching the drawer
- White cards for each section with soft shadows
- Responsive design that works on all screen sizes

### Snippets Management
- Grid/list view of all snippets
- Each card shows:
  - The snippet text
  - Category badge (colored)
  - Usage statistics
  - Edit and Delete buttons
- "Add Snippet" button creates new entries
- Modal dialog for adding/editing with form fields:
  - Text input
  - Category dropdown
  - Save/Cancel buttons

### Saved Prompts Management
- Similar card layout to snippets
- Preview text (truncated if long)
- Usage count
- Edit and Delete buttons
- Modal with textarea for full prompt entry

### Data Management Actions
Three buttons for bulk operations:
- **Export Data** - Download JSON backup
- **Import Data** - Restore from backup
- **Reset to Defaults** - Start fresh

## 🎯 Context Menu Integration

Right-click on any selected text to see:
- "Save to Prompt Drawer (snippet)" - for short phrases
- "Save to Prompt Drawer (full prompt)" - for complete prompts

Shows a notification when saved successfully!

## 📊 Smart Features

### Usage Tracking
- Every time you click a snippet, its usage count increments
- Snippets and prompts automatically reorder based on frequency
- Most-used items bubble to the top
- Helps you access your favorites faster over time

### Text Insertion
Works intelligently with:
- Regular input fields (text, email, etc.)
- Textareas
- ContentEditable elements (like rich text editors)
- Falls back to clipboard copy if no field is focused

### Data Sync
- All data stored in Chrome's sync storage
- Automatically syncs across all your Chrome browsers
- Sign in to Chrome to access your prompts on any device

## 🎭 Default Snippets Included

The extension comes pre-loaded with 12 useful snippets across all categories:

**Role (3):**
- Act as a [ROLE]
- Act as a technical writer
- Act as a copywriter

**Brevity (2):**
- No fluff!
- Be concise and direct

**Mood (3):**
- Explain like I'm 5
- Use a professional tone
- Be creative and playful

**Format (2):**
- Output as JSON
- Use markdown formatting

**Meta (2):**
- Show your reasoning step by step
- Ask clarifying questions first

## 🔧 Technical Implementation

Built with modern web technologies:
- **Manifest V3** - Latest Chrome extension format
- **Vanilla JavaScript** - No framework dependencies, lightweight
- **CSS Gradients & Animations** - Smooth, performant visuals
- **Chrome Storage API** - Secure data persistence
- **Context Menus API** - Right-click integration
- **Content Scripts** - Seamless page integration

## 💡 Use Cases

Perfect for:
- Frequent AI assistant users (ChatGPT, Claude, etc.)
- Content creators who reuse prompt patterns
- Developers testing AI API integrations
- Researchers doing prompt engineering
- Anyone who types the same instructions repeatedly

## 🚀 Performance

- Lightweight: ~50KB total size
- Fast initialization
- No impact on page load times
- Minimal memory footprint
- Only active when drawer is open

---

Ready to supercharge your AI interactions! 🎉
