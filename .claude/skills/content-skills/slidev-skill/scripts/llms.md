description: Naive UI 2
alwaysApply: true
applyTo: "**"
downloadedFrom: https://www.naiveui.com
version: 2.43.x
Naive UI 2

Naive UI 2 is a Vue 3 component library offering a wide range of UI components with theme customization and TypeScript support. It provides many components suitable for building interactive slide decks (e.g. using Slidev) with consistent styling.

Naive UI documentation – Official docs and usage guidelines

Latest stable version: 2.43.x (Ensure components and props are compatible with this version)

Installation & Usage

To install Naive UI, use npm or yarn:

npm install naive-ui  


In a Vue 3 project (including Slidev), import the needed components. For example, in a Slidev markdown slide’s <script setup>:

import { NButton, NCard, NImage, NSpace } from 'naive-ui';  


You can then use <n-button>, <n-card>, etc. in your slide content. It’s recommended to wrap your app with <n-config-provider> to enable dark theme support and global configurations if needed, though basic usage works out-of-the-box with default themes.

Components for Slide Content

Below are common Naive UI components useful in slide presentations, along with their props, default values, usage examples, and best practice tips. Each component is prefixed with N (e.g. NButton for <n-button>).

Typography & Text

Naive UI provides components for formatted text, including NText for inline text styling and semantic heading components NH1 ... NH6 for titles. Use these to ensure text adapts to theme styles. (No dedicated “Typography” component; use these building blocks).

Props (NText)

type (String) – Default: "default" – Visual style or color of text. Options include "primary", "success", "info", "warning", "error", or "default" for normal text. This applies theme-specific colors (e.g. type="primary" makes text colored with primary theme color).

strong (Boolean) – Default: false – Whether the text is bold (font-weight). Similar to <strong> tag.

italic (Boolean) – Default: false – Italicizes the text. Similar to <em> styling.

underline (Boolean) – Default: false – Underlines the text.

delete (Boolean) – Default: false – Strikesthrough (deleted text style).

code (Boolean) – Default: false – Renders text in a monospace “code” style (inline code look).

depth (Number 1/2/3) – Default: none – Sets text color depth (tone) for hierarchy. Higher depth (3) yields a lighter, less emphasized color, while 1 is default content color
app.unpkg.com
app.unpkg.com
. Use to deemphasize text (e.g. secondary captions).

tag (String) – Default: "span" (for NText) – The HTML tag to render. Can be set to "div", "p", etc. Usually you can leave it default unless a block element is needed.

(NH1–NH6 share similar usage to HTML <h1>...<h6> for headings; they do not require additional props aside from standard ones like style or class.)

Example
<n-text type="primary" strong>Important</n-text> – <n-text depth="3">muted info text</n-text>  

<NH1>Slide Title</NH1>  
<n-text italic>Subtitle or description text.</n-text>  

Best Practices

Use semantic components: Use NH1...NH6 for slide titles and subtitles instead of manually styling text – they automatically apply consistent font sizes and weights based on theme
app.unpkg.com
.

Theming: Leverage the type prop to match text to the theme’s semantic colors (e.g. primary, info). This ensures text colors switch appropriately in dark mode and maintain consistency.

Depth for emphasis: Use depth to adjust text contrast for less important text (e.g. depth="3" for captions or footnotes) – this uses theme’s predefined lighter text colors, ensuring readability with the theme
app.unpkg.com
app.unpkg.com
.

Avoid inline CSS for basic styles: Instead of writing your own bold or italic styles, prefer strong, italic, etc. props so that styling is consistent with Naive UI’s design system.

Button

Buttons allow user interaction in slides (e.g. starting a demo, toggling content). NButton is a versatile component with various style props. Button docs

Props

type (String) – Default: "default" – Button style variant. Options: "default", "primary", "success", "info", "warning", "error", or "tertiary"
blog.csdn.net
. This changes background and text colors accordingly (e.g. primary is typically a filled primary-color button). "default" is a neutral button.

size (String) – Default: "medium" – Size of the button. Options: "small", "medium", "large". This affects padding and font size.

disabled (Boolean) – Default: false – Whether the button is disabled (non-interactive and greyed out).

loading (Boolean) – Default: false – If true, shows a loading spinner inside the button and disables interactions
blog.csdn.net
. Useful for indicating processing.

ghost (Boolean) – Default: false – Makes a “ghost” button with a transparent background and colored border (often used on dark backgrounds).

round (Boolean) – Default: false – Adds fully rounded corners to the button (pill shape).

circle (Boolean) – Default: false – Makes the button a perfect circle (if it has no text, typically used with icon only).

text (Boolean) – Default: false – Renders a text-only button (no background or border, like a link-style button). (Alternatively, use type="text" which Naive UI also supports as a preset type
blog.csdn.net
.)

icon (VueNode) – Default: none – An icon to display inside the button. You can pass an NIcon component or <template #icon> slot content.

tag (String) – Default: "button" – The HTML tag to render. You can set "a" to render as anchor or "router-link" (with additional setup) if needed for navigation.

(Additional props include secondary and tertiary boolean props for alternative style emphasis, and native button attributes like native-type ("submit", "reset"), but these are less commonly used in slide contexts.)

Example
<n-button type="primary" size="large" @click="nextSlide">Next 🠖</n-button>  
<n-button ghost strong>Ghost Button</n-button>  
<n-button text disabled>Disabled Link</n-button>  
<n-button circle icon><template #icon>⭐</template></n-button>  

Best Practices

Use semantic types: Use type prop for meaning – e.g., use primary for main call-to-action on a slide, success for a positive action or result, etc. This ensures the button color aligns with context (e.g. green for success) and theme
blog.csdn.net
.

Icon buttons: For icon-only buttons, set circle for a round shape and include the icon via the icon slot or prop (as shown above). Also consider adding aria-label for accessibility since no text is present.

Loading state: Use the loading prop when an action triggered by the button takes time. This gives users feedback – the button will show a spinner and be disabled until you set loading back to false.

Avoid excessive custom CSS: Naive UI buttons come with well-designed styles. Prefer using props like ghost, text, round instead of writing custom CSS for those effects, to maintain consistency.

Accessibility: If using tag="a" for navigation, also supply href attribute. Disabled buttons should stay button tags (anchors don’t support true disabled state).

Card

Cards are used to group related content in a container with an optional header and footer. NCard is useful for slide sections or examples that need a boxed layout. Card docs

Props

title (String | VNode) – Default: none – Title text or content for the card header. If provided, renders a header section.

bordered (Boolean) – Default: true – Whether the card has a border outline. Set false for a borderless look (card will blend with background).

hoverable (Boolean) – Default: false – If true, card will have a hover effect (e.g. slight lift or shadow) indicating it’s interactive. Good for clickable cards.

size (String) – Default: "medium" – Card size/padding. Options: "small", "medium", "large". This affects the padding and possibly font-size in header.

loading (Boolean) – Default: false – When true, card displays a loading state (often a spinner or skeleton in place of content) to indicate data is being fetched.

header-style (String | Object) – Default: none – Custom CSS style for the header section. Similarly, body-style for the body content section, and footer-style for footer if needed.

footer (String | VNode) – Default: none – Content for a footer section at the bottom of the card (e.g. buttons or summary text). If provided, it’s rendered in a styled footer area.

actions (Array<Object>) – Default: none – An array of action objects to display as buttons or links in the top-right corner of the card header. Each action can have properties like text and onClick handler. This is useful for small actions like “Edit” or “Details”.

cover (String | VNode) – Default: none – An image or media to display at the top of the card (cover image). You can pass an <n-image> or <img> here.

avatar (String | VNode) – Default: none – An avatar image/content to display next to the title in the header (commonly a small circle image).

description (String | VNode) – Default: none – Additional descriptive text to display below the title in the header (like a subtitle).

Example
<n-card title="My Photo Album" hoverable :actions="[{ text: 'More info', onClick: showInfo }]">  
  <template #cover>  
    <n-image src="cover.jpg" alt="Cover Photo" width="100%" />  
  </template>  

  <p>This card contains a collection of images from my travels.</p>  

  <template #footer>  
    <n-button size="small" text @click="openGallery">View Gallery</n-button>  
  </template>  
</n-card>  

Best Practices

Structure content: Use the title, description, and footer slots/props instead of manual headings inside the card. This ensures proper spacing and styling (title is bold, description is lighter, footer is separated by a top border, etc.).

Conditional sections: If a section is not needed, omit the prop/slot entirely. For example, if no footer is provided, the card simply won’t render a footer area, keeping the design clean.

Grouping in slides: Use cards to encapsulate examples or case studies on a slide. For instance, a slide with multiple case studies could have each in an <n-card> for separation. Cards naturally have some padding and drop shadow (if bordered/hoverable) that make each unit distinct.

Hoverable usage: Enable hoverable for cards that are clickable (e.g., a card that when clicked navigates or reveals more). The hover styling will cue users that the card can be interacted with. For static content cards, keep hoverable false to avoid miscue.

Performance: For a large number of cards (not typical in slides, but in case), you can set loading to true initially and then false when content is ready to show skeletons. This can smooth out loading transitions on a slide.

Divider

NDivider renders a separator line, useful for splitting content within a slide. It can be horizontal or vertical and optionally display text. Divider docs

Props

vertical (Boolean) – Default: false – If true, renders a vertical divider (a downwards line) instead of horizontal. Use in horizontal layouts (like columns) to separate content side-by-side.

dashed (Boolean) – Default: false – Whether the divider line is dashed. A dashed divider can be visually softer than a solid line.

title-placement (String) – Default: "center" – Alignment of the title text if provided. Options: "left", "center", "right". Controls where the text appears on the line.

orientation (String) – Default: "horizontal" – Orientation of the divider. Usually you toggle this via vertical prop instead (set orientation="vertical" is equivalent to vertical=true).

content (String | VNode) – Default: none – Text or content to display on the divider line. If content is provided (via default slot or a prop), the divider will break to accommodate it. By default, content is centered, but title-placement can adjust it.

Example
<p>Introduction section of the slide</p>  
<n-divider dashed>End of Intro</n-divider>  
<p>Next section content...</p>  

<NSpace :align="'center'">  
  <!-- Using vertical divider between two columns of text -->  
  <div>Column A content</div>  
  <n-divider vertical />  
  <div>Column B content</div>  
</NSpace>  

Best Practices

Spacing: Naive UI’s divider has its own margin (default 16px top & bottom for horizontal). In a Slidev context, you might want to adjust spacing around it with utility classes or by wrapping in an NSpace. Use :style on <n-divider> (e.g. margin="2em 0") if you need custom spacing.

Section titles: You can use an NDivider with content to label subsections. For example, <n-divider title-placement="left">Details</n-divider> will produce a left-aligned “Details” label on the line. This is an easy way to insert a small heading in the flow of content.

Vertical usage: When using a vertical divider, ensure the parent container (like NSpace or flexbox) has a fixed height or is flex, so the divider stretches to the appropriate length. A vertical divider will typically span the full height of its container.

Avoid overuse: Dividers are visually strong. Use them sparingly to split major sections. For lighter separation, consider using NSpace with some gap or a subtle background change instead, to avoid too many lines cluttering the slide.

Image

NImage displays images with built-in support for lazy loading and an interactive preview (lightbox) feature. It’s useful for slides to show photos or diagrams with consistent styling and optional zoom. Image docs

Props

src (String) – The image source URL. (No default – this prop is required to display an image.)

alt (String) – Default: "" – Alternate text for the image, used for accessibility or when the image cannot load. Always provide alt text describing the image content.

width (String | Number) – Default: auto – Width of the image. You can use CSS length (e.g. "300px" or "50%") or number (treated as pixels). If not specified, the image displays at its natural width (or constrained by parent container).

height (String | Number) – Default: auto – Height of the image. Often you can omit explicit height to maintain aspect ratio (width or container will scale it).

object-fit (String) – Default: "fill" – How the image should fit its container if width/height are set. Options: "fill", "contain", "cover", "none", "scale-down". For most cases, "contain" (show whole image, letterbox if needed) or "cover" (fill container, cropping excess) are useful.

lazy (Boolean) – Default: false – If true, enables lazy loading: the image will only load when it’s about to come into view. This is useful if you have many images or heavy images off-screen. In slides, you might set lazy for images not on the first loaded slide to improve initial load performance.

intersection-observer-options (Object) – Default: browser default – Options to configure the threshold and rootMargin for lazy loading (used with lazy). You typically don’t need to change this unless fine-tuning when images load.

preview-src (String) – Default: null – If provided, this URL will be used for the high-resolution image in preview modal (lightbox), while src is used as thumbnail. Use this if you want to load a smaller image initially and a larger image for zoom.

preview-disabled (Boolean) – Default: false – If true, disables the click-to-preview behavior. By default, NImage is clickable: when clicked, it opens a full-screen preview of the image with zoom controls. Set this to true if you want to turn off that feature (e.g. if you have custom click behavior or simply don’t want preview).

show-toolbar (Boolean) – Default: true – Whether to show the toolbar in the image preview modal (which contains zoom in/out, rotate, close buttons)
app.unpkg.com
app.unpkg.com
. You can disable the toolbar if you want a simpler lightbox.

show-toolbar-tooltip (Boolean) – Default: false – Whether to show tooltips on the buttons in the preview toolbar (e.g. “Zoom In”, “Rotate”). By default this is off. If you think users might need guidance on icons, you can enable it.

onPreviewPrev (Function) – Default: undefined – Callback when the user clicks the “previous” button in the preview (if this image is part of an NImageGroup). You usually don’t handle this manually; it’s managed when using NImageGroup.

onPreviewNext (Function) – Default: undefined – Similar to above, for the “next” button in preview. (In an NImageGroup, these let the lightbox navigate between images.)

img-props (Object) – Default: none – Additional native HTML attributes for the underlying <img> tag (for example, { referrerpolicy: "no-referrer" } or custom class/style).

fallback-src (String) – Default: none – URL of a fallback image to display if the main src fails to load (e.g. a broken link or network error). This is a good place to put a placeholder image path.

load-description (String) – Default: none – Text to display as a placeholder while the image is loading (e.g. “Loading…”). If not set, a default spinner may be shown.

Example
<!-- Basic image with preview -->  
<n-image src="diagram.png" alt="Architecture Diagram" width="600" />  

<!-- Image with disabled preview, custom object fit, and lazy loading -->  
<n-image src="photo_thumb.jpg" 
         alt="Sample Photo" 
         width="400" height="300" 
         object-fit="cover" 
         preview-disabled 
         lazy />  

<!-- Image group for a gallery of images on a slide -->  
<n-image-group>  
  <n-image src="img1_thumb.jpg" preview-src="img1_full.jpg" alt="Image 1" />  
  <n-image src="img2_thumb.jpg" preview-src="img2_full.jpg" alt="Image 2" />  
</n-image-group>  


(The <n-image-group> wrapper allows multiple images to be viewed in one lightbox, with prev/next controls. Use it when you have a set of images on one slide.)

Best Practices

Use preview for detailed images: By default, clicking an image opens it in a full-screen viewer. This is great for detailed charts or code screenshots on slides – users can click to zoom in. If an image doesn’t need zoom (like an icon or simple graphic), you can disable preview to avoid distraction (preview-disabled=true).

Lazy loading: For slide decks, you can set lazy on images that appear in later slides. This way, images load only when needed (when the slide comes into view), which can make the initial load of your presentation faster. Balance this with the possibility of a slight delay when the slide is reached – if the image is critical to instantly show, you might preload it instead.

Consistent sizing: Use the object-fit prop to ensure images cover their container or fit within it uniformly. For example, to display a series of team photos in equal circles, set each width/height and object-fit="cover" so they crop uniformly. In contrast, for diagrams where you want the whole image visible, use object-fit="contain" (and maybe a set height) so no part is cut off.

Captions: Naive UI’s NImage doesn’t include a caption prop. If you need a caption, simply put a <figcaption> or styled <div> below the image in your slide. You can also wrap image and caption in an NCard or NSpace for better layout.

Image Group navigation: If you use <n-image-group> to allow browsing multiple images in one lightbox, ensure each NImage in the group has proper alt text and perhaps a visually hidden label if necessary, since the toolbar will allow moving between them. The group will automatically handle the onPreviewPrev/Next events for you
app.unpkg.com
.

Carousel

For slides needing an inner carousel (e.g. rotating quotes or images within a single slide), Naive UI offers NCarousel. It displays a set of content items (like images or text panels) that can slide or fade from one to the next. Carousel docs

Props

default-index (Number) – Default: 0 – Index of the slide to display initially (0-based). For example, set to 2 to start on the third item.

current-index (Number) – Default: uncontrolled – You can use this for controlled carousels (with v-model). If provided, it will always show the slide at this index; you should update it in response to user actions.

autoplay (Boolean) – Default: false – Whether the carousel should automatically play (cycle through slides) on its own. If true, slides will transition at the interval defined by interval.

interval (Number) – Default: 5000 – Time in milliseconds between automatic transitions when autoplay is true. Default is typically 5000ms (5 seconds).

loop (Boolean) – Default: true – Whether to loop back to the first slide after the last slide. If false, autoplay will stop at the end, and manual navigation won’t wrap around. Usually you want loop=true for continuous rotation
cdn.jsdelivr.net
.

effect (String) – Default: "slide" – The transition animation between slides. Options: "slide" (horizontal sliding), "fade" (crossfade), "card" (carousel with perspective card-stack effect), or "custom" (if you provide custom transition). Use "slide" for a standard carousel, "fade" for gentle crossfades (e.g. fading text quotes), or "card" for a 3D card look
cdn.jsdelivr.net
.

direction (String) – Default: "horizontal" – Direction of slide movement. Options: "horizontal" or "vertical". A vertical carousel will swipe up/down instead of left/right.

show-arrow (Boolean) – Default: false – Whether to always show navigation arrows (prev/next) on the carousel. By default, arrows might only show on hover or not at all (depending on design). Setting this to true forces arrow buttons to be visible.

show-dots (Boolean) – Default: true – Whether to show indicator dots (or lines) for each slide at the bottom of the carousel. Indicators allow users to see current position and click to jump to a slide
cdn.jsdelivr.net
.

dot-type (String) – Default: "dot" – Style of the indicators if shown. Options: "dot" (small dots) or "line" (short line indicators)
cdn.jsdelivr.net
. Dots are typical for image carousels, lines can be nice for full-width banners.

dot-placement (String) – Default: "bottom" – Where to place the indicator dots. Options: "top", "bottom", "left", "right". If you set left/right, the dots will be vertical alongside the carousel. Make sure to also adjust direction accordingly (vertical placement often goes with vertical carousels)
cdn.jsdelivr.net
.

trigger (String) – Default: "click" – How to trigger a slide change when clicking an indicator dot. Options: "click" or "hover". "hover" means simply hovering over a dot will switch slides (useful for quick browsing but can be jarring). Default "click" is usually safer.

slides-per-view (Number or "auto") – Default: 1 – How many slides to show at once. Default 1 means only one slide fully visible. You can set a number like 3 to show multiple slides in a frame (like a multi-column carousel), or "auto" to auto-calc based on container width.

space-between (Number) – Default: 0 – Gap (in pixels) between slides. If you show multiple slides at once, you might set a gap (e.g. 16) so there’s spacing between each.

centered-slides (Boolean) – Default: false – When multiple slides are visible, if true, the active slide will be centered rather than aligning the first slide to the left. Typically used with odd slides-per-view counts and some space-between.

draggable (Boolean) – Default: false – If true, users can click and drag/swipe the carousel with mouse or touch to navigate (in addition to arrows or dots). By default, swiping is enabled via touch but this prop explicitly toggles mouse dragging.

touchable (Boolean) – Default: true – Whether touch-swipe is enabled on mobile devices. (Usually true by default, you might set false if you don’t want users accidentally swiping when scrolling through a slide).

keyboard (Boolean) – Default: false – If true, enables keyboard navigation (e.g. arrow keys to move slides when carousel is focused). Off by default, you can enable it for accessibility.

on-update:current-index (Callback) – Emits when the current slide index changes (either via user interaction or autoplay). Useful if you want to hook into slide changes (e.g. to update some external state or stop/start a video embedded in a slide when that slide appears).

(Use the <n-carousel-item> component inside NCarousel to define each slide’s content. Each <n-carousel-item> can contain any HTML/components. There are no special props required on carousel items aside from an optional name or key.)

Example
<n-carousel autoplay interval="3000" show-arrow :loop="true">  
  <n-carousel-item>  
    <img src="promo1.png" alt="Promo 1"/>  
  </n-carousel-item>  
  <n-carousel-item>  
    <img src="promo2.png" alt="Promo 2"/>  
  </n-carousel-item>  
  <n-carousel-item>  
    <img src="promo3.png" alt="Promo 3"/>  
  </n-carousel-item>  
</n-carousel>  

<!-- Carousel with text slides and fade effect -->  
<n-carousel effect="fade" :show-dots="true" dot-type="line" trigger="hover">  
  <n-carousel-item> <blockquote>“Quote 1...”</blockquote> </n-carousel-item>  
  <n-carousel-item> <blockquote>“Quote 2...”</blockquote> </n-carousel-item>  
  <n-carousel-item> <blockquote>“Quote 3...”</blockquote> </n-carousel-item>  
</n-carousel>  

Best Practices

Use sparingly in slides: A carousel inside a slide can be useful to cycle through a few related pieces of content without moving to a new slide. However, avoid nesting too much information in a carousel; it can be hard for viewers to follow if slides auto-rotate. Ensure the audience has control (e.g. visible arrows or dots to manually navigate) if using this for critical content.

Timing: If using autoplay, set a suitable interval. 3-5 seconds is typical for images; consider longer for text-heavy slides so people can read. Also, be cautious: in a live-talk setting, an autoplaying carousel might advance when you don’t expect. You might prefer manual control (autoplay=false) unless the looping is purely decorative.

Indicator and arrow visibility: In presentation contexts, always set show-dots or show-arrow so the audience knows multiple pieces of content are present. Dots are great for images; if content is textual, ensure dot labels aren’t needed (or consider using a custom dot slot to label each dot). Arrows can be enabled (show-arrow) for easier navigation, especially if not every viewer understands they can click dots.

Responsive design: If displaying multiple items per view (slides-per-view > 1), use CSS or the responsive prop features (if available) to adjust for smaller screens. Naive UI’s carousel will shrink items, but you may want to reduce slides-per-view on mobile. Currently, you can dynamically change props based on screen width in your Vue component (e.g. data or computed props controlling slides-per-view).

Performance: Naive UI carousel is efficient, but if each slide contains heavy content (e.g. large images or videos), only mount what’s needed. You can defer loading off-screen content until it’s about to show (using on-update:current-index to trigger loading for upcoming slide). Also consider wrapping videos or iframes in <n-skeleton> or using lazy for images inside carousel items.

Layout (Grid & Space)

For arranging content on a slide (columns, spacing, etc.), Naive UI provides NGrid (with NGridItem or the shorthand NGi) and NSpace. These help create flexible layouts without writing custom CSS, ensuring spacing is consistent with the theme.

NGrid is a 24-column responsive grid system, similar to other UI libraries. NSpace is a simpler flex container for evenly spacing items. Use NGrid when you need responsive columns or more complex layouts; use NSpace (or plain <div> with CSS flex) for simpler horizontal or vertical stacks with consistent gaps.

NGrid Props

cols (Number) – Default: 24 – Number of total columns in the grid. Default 24 columns is standard. This can be set to a smaller number for simpler grids, but generally 24 is kept and you specify span for items.

x-gap (Number) – Default: 0 – Horizontal gap between grid items, in pixels. e.g. x-gap="16" adds 16px horizontal spacing.

y-gap (Number) – Default: 0 – Vertical gap between rows. Use these gap props instead of manual padding to ensure consistent spacing between items.

responsive (String) – Default: "self" – If set to "self", the grid itself becomes responsive (it will collapse columns on narrower screens according to breakpoints). If set to "screen", it uses the screen width breakpoints. (In practice, you’ll use the :xxl, :xl, :lg, etc. props on items for responsiveness, see below.)

inline (Boolean) – Default: false – If true, the grid container will be inline-block. Usually you keep this false (block).

Each NGridItem (alias <n-gi>) can take props to define its span:

span (Number) – Default: automatically fill – How many columns out of the grid to occupy. For example, span="12" in a 24-column grid will take half width. If not set, items will auto-distribute (or you can use cols directly on NGrid for a fixed number of equal columns).

offset (Number) – Default: 0 – How many columns of space to leave to the left of this item (like a margin on the grid). Use to create gaps or push content.

xxl, xl, lg, md, sm, xs (Number) – Default: none – Responsive span values for various breakpoints (based on screen width). For example, :xs="24" could make the item full-width on extra-small screens, :md="12" half-width on medium screens, :xl="8" one-third width on extra-large screens, etc. This is how you create responsive layouts that adjust column spans at different viewport sizes
stackoverflow.com
stackoverflow.com
.

(Breakpoints definitions follow typical widths: xs ~ <480px, sm ~ <576px, md ~ <768px, lg ~ <992px, xl ~ <1200px, xxl ~ >=1200px, approximately. Naive UI uses these to adapt layout when responsive="screen".)

NSpace Props

vertical (Boolean) – Default: false – If true, items in the space stack vertically (column). Default is horizontal (row).

size (String | Number | [Number, Number]) – Default: "medium" – The gap size between items. Can be preset sizes ("small", "medium", "large") or a number in pixels, or an array [horizontalGap, verticalGap] for different horizontal/vertical spacing. E.g. size="large" gives a larger gap than medium; :size="[8, 16]" gives 8px horizontal, 16px vertical gap.

align (String) – Default: "start" – Alignment of items in the cross-axis. If vertical=false (horizontal layout), align controls vertical alignment of items ("start", "center", "end" corresponds to flex-start, center, flex-end). If vertical=true, it controls horizontal alignment. Use "center" to center items along the line.

justify (String) – Default: "start" – How to distribute space in the main axis (works similar to CSS justify-content). Options: "start", "center", "end", "space-around", "space-between", "space-evenly". For example, justify="space-between" will push first and last items to edges with equal space between all items.

item-style (String | Object) – Default: none – Style to apply to each child element within the space. This is handy if you want each item to have a common style (like a min-width or border for all items).

wrap (Boolean) – Default: true – If false, the items will not wrap to a new line (they’ll overflow if too many in a row). Default true allows items to flow to next line if they don’t fit in one line (when horizontal).

Example (Grid)
<n-grid :cols="24" x-gap="16" y-gap="16">  
  <n-gi :xs="24" :sm="12" :lg="8">Column 1</n-gi>  
  <n-gi :xs="24" :sm="12" :lg="8">Column 2</n-gi>  
  <n-gi :xs="24" :sm="24" :lg="8">Column 3</n-gi>  
</n-grid>  


(Above: On mobile (xs) each column spans all 24 (full width, stacking), on small screens each spans 12 (so two per row), on large screens each spans 8 (three per row)
stackoverflow.com
.)

Example (Space)
<!-- Horizontal space example -->  
<n-space align="center" size="large">  
  <n-card title="Fact 1" style="width: 45%">Content A</n-card>  
  <n-card title="Fact 2" style="width: 45%">Content B</n-card>  
</n-space>  

<!-- Vertical space example (as a list) -->  
<n-space vertical size="small">  
  <div>Point 1</div>  
  <div>Point 2</div>  
  <div>Point 3</div>  
</n-space>  

Best Practices

Choosing Grid vs Space: Use NGrid when you need a structured, multi-row layout that might collapse responsively. Use NSpace for simple one-dimensional layouts or uniformly spaced items. For instance, to place two charts side by side on a slide and stack them on mobile, NGrid with responsive spans is ideal. To just center a logo and a title with some gap, NSpace is simpler.

Responsive slides: If your slides will be viewed on varying screen sizes, leverage NGrid’s responsive props (xs through xl). This can ensure content doesn’t overflow on small screens. In Slidev, content typically scales, but for truly responsive behavior, grid breakpoints help. Plan the span for each item at different breakpoints (e.g. a 2-column layout can become 1-column on mobile by setting :xs="24" on all items)
stackoverflow.com
.

Consistent gaps: Instead of manual CSS margins between elements, use x-gap/y-gap in NGrid or size in NSpace. This centralizes spacing control. For example, if you want more space between sections, increasing one prop (like y-gap in an outer grid) is easier than adjusting multiple margins.

Alignment in NSpace: The align prop is particularly useful in horizontal spaces when items have different heights (like an icon next to text). align="center" vertically centers them. Use justify to distribute free space; e.g., justify="center" to center a row of logos on a slide.

Wrapping: If using NSpace horizontally with many items (like a tag cloud or multiple logos), be mindful of wrapping. By default, wrap=true will send overflowing items to a new line, which is usually what you want. If you specifically want to avoid line breaks, set :wrap="false" and be prepared for horizontal scrolling or overflow handling.

Code Block (Code)

To display code snippets with consistent styling (monospaced font, optional line numbers or highlighting), use NCode. This component formats blocks of code, making them theme-consistent (e.g. it will adapt to dark mode). This is useful in slides for showing example code or CLI commands. Code docs

Props

code (String) – The code content to display. You can alternatively place code between the component tags as slot content (e.g. <n-code>let x = 5;</n-code>). This prop is useful if your code is in a variable.

language (String) – Default: none (plaintext) – Language for syntax highlighting (e.g. "javascript", "html", "bash"). Naive UI will apply basic token classes if supported. (Ensure you’ve included the corresponding prismjs or highlight.js CSS if Naive UI relies on it, or the theme’s built-in if any. If language is not specified, it just displays raw text.)

trim (Boolean) – Default: true – Whether to trim leading/trailing empty lines in the provided code. This is handy to avoid accidental blank lines at start or end when you paste code with line breaks.

highlight-lines (Array<Number>) – Default: none – An array of line numbers to highlight. If provided, those lines will have a highlight background. Use this to call attention to specific lines in a code snippet (like highlighting a changed line).

line-numbers (Boolean) – Default: false – Whether to show line numbers on the left. If true, each line of code will be prefixed with its line number (useful for reference in discussion).

word-wrap (Boolean) – Default: false – If true, long lines will wrap. By default, code will scroll horizontally if it’s too long (no wrapping) which preserves formatting. Enable wrap if horizontal scrolling is undesirable (e.g. for small screens or if you want the whole code visible at once).

inline (Boolean) – Default: false – If true, renders as an inline code element (like <code> within a sentence) instead of a block. You normally use NCode for block display, so this is usually false.

copyable (Boolean) – Default: false – If true, a copy-to-clipboard button will appear, allowing users to copy the code snippet easily. Great for presentations where viewers might want to grab the code.

Example
<!-- Basic code block with language and line numbers -->  
<n-code language="javascript" line-numbers :highlight-lines="[2]">  
function greet(name) {  
  console.log("Hello, " + name); // Highlight this line  
  return 42;  
}  
</n-code>  

<!-- Inline code example -->  
<p>To install, run <n-code inline language="bash">npm install naive-ui</n-code> in your project.</p>  

Best Practices

Use appropriate language: Set the language prop so that code is styled correctly. Even if you don’t load an external highlighter, Naive UI may style keywords differently. It also allows the audience to quickly identify what language the snippet is in.

Keep it short: Slides should not have very long code blocks. Try to keep code examples to an essential snippet (perhaps 5-15 lines). If more is needed, consider splitting into multiple slides or using highlights to focus attention. When showing multiple parts, you can use multiple NCode components or reveal portions sequentially.

Highlight important lines: Utilize highlight-lines to draw attention to the core part of the code. For example, if you’re explaining a diff or a particular call, highlight that line so the audience’s eyes are drawn there
app.unpkg.com
. Combine this with explaining text or arrows on your slide for emphasis.

Line numbers and references: If you plan to refer to “Line 3” or “The code on line 10” in your talk, turn on line-numbers to make it easy for viewers to follow. Otherwise, you can leave line numbers off for a cleaner look.

Copyable snippets: In an interactive slide (or if the slides will be shared), copyable can be very useful. It adds a small clipboard icon – in a workshop setting, viewers can click to copy the code and try it. If you enable it, mention it to the audience so they know they can copy.

Avoid overflow: If a code line is very long and doesn’t naturally break, by default NCode will allow horizontal scrolling. This preserves formatting (which is usually desirable for code). However, if you’re designing for a specific resolution and want to avoid any scrolling, consider setting word-wrap=true. Alternatively, manually break the line in your snippet for presentation purposes (insert \n where it’s logical, or use a smaller font by applying a class with smaller font-size via codeProps if absolutely needed).

Styling: Naive UI’s code block will use a monospaced font and theme-appropriate background (often slightly tinted). If you need to tweak styling (e.g. different font or background), prefer using CSS targeting .n-code class or the themeOverrides prop via NConfigProvider. This keeps the styling consistent across all code blocks.

Tabs

If you want to show multiple related pieces of content in the same space (e.g. switching between two code examples or results vs. output) within a slide, NTabs can be used. It renders a tabbed interface with tabs (labels) and panels. Each NTabPane is a content section. Tabs docs

Props (NTabs)

value (String | Number) – Default: index of first tab – The key identifying the active tab. Usually this corresponds to the name of an NTabPane. You can use .v-model:value to two-way bind the active tab. If not set, it will fall back to using the index order.

default-value (String | Number) – Default: first tab’s name – The initial active tab key if using uncontrolled tabs. If you don’t want to v-model, set this to choose a starting tab other than the first.

type (String) – Default: "bar" – Style of the tabs. Options: "bar", "card", etc. "bar" style is the default with an underline indicator under the active tab label (like classic horizontal tabs)
app.unpkg.com
. "card" style makes each tab look like a segmented control or button (useful if tabs represent modes).

justify-content (String) – Default: "start" – How to justify the tab labels within the container. Options: "start", "center", "end", "space-between", etc. For example, "center" will center all tabs, "space-between" will spread them to fill the width.

size (String) – Default: "medium" – Size of the tab labels. Options: "small", "medium", "large". This affects the font size and padding of the tab buttons.

closable (Boolean) – Default: false – Whether tabs can be closed by the user. If true, tabs will show a close “×” icon (usually on hover) and you should handle the close event to remove the tab (via onClose or using v-if on the pane). Typically not used in static slide content, more for dynamic interfaces.

addable (Boolean or Object) – Default: false – If true (or an object with options), shows an “add” button (usually a “+”) to the right of tabs, allowing the user to add a new tab. In slides, you likely won’t use this, since content is predetermined.

animated (Boolean) – Default: true – Whether to use animation when switching tabs. True gives a smooth transition (sliding or fading depending on style). Can be set false for instant switch.

placement (String) – Default: "top" – Where the tabs are placed relative to content. Options: "top", "bottom", "left", "right". For standard use, "top" is common (tabs above content). Use left/right if you want vertical tabs (labels in a column). Ensure the type style supports vertical (bar style will rotate the bar accordingly).

tabs-padding (Number) – Default: 0 – Extra padding (px) around the tab labels area. You can use this to adjust spacing if needed (though usually not necessary).

on-update:value (Function) – Emits when the active tab changes (either by user click or programmatic). Use this to respond to tab changes if needed (e.g. tracking analytics or triggering an event like starting an animation when a particular tab is shown).

Each NTabPane (child of NTabs) has:

name (String | Number) – Identifier for the tab. This should match the value prop to activate this pane. If not set, it may default to index order, but it’s best practice to provide a unique name.

tab (String | VNode) – The label of the tab, displayed in the tab bar. This can be text or an icon or any HTML. Keep it short for clarity (one or two words).

disabled (Boolean) – Default: false – If true, this tab is disabled (unclickable). It will still render but not respond to selection. Use if some content is not available or applicable.

display-directive (String) – Default: "if" – This controls how inactive tab content is handled in the DOM. "if" means inactive tabs are not rendered at all (destroyed from DOM), "show" means inactive tabs are just hidden via CSS but remain in DOM. The default "if" helps performance (especially if heavy content) but if you want state to persist in inactive tabs (e.g. form inputs not losing their values when you switch tabs), consider using "show".

Example
<n-tabs v-model:value="activeTab" type="bar" justify-content="center">  
  <n-tab-pane name="console" tab="Console Output">  
    <pre>{{ consoleText }}</pre>  
  </n-tab-pane>  
  <n-tab-pane name="graph" tab="Graph View">  
    <img src="graph.png" alt="Graph result"/>  
  </n-tab-pane>  
</n-tabs>  


(In this example, two tabs allow toggling between text output and a graph image. The justify-content="center" centers the tabs in the slide.)

Best Practices

Use for alternate views: Tabs are great when you have two or three alternate views of the same data or related content and want to let the user choose. For example, code vs. output, chart vs. table, different language code samples, etc., all on one slide without cluttering by showing all at once. Clearly label tabs (the tab prop) so the audience knows what they represent.

Avoid too many tabs: Don’t overload a single slide with too many tabs (e.g. more than ~3). It can be overwhelming and likely means the slide is trying to do too much. If you have many categories, consider splitting into multiple slides or using a different format (like an accordion or simply separate content).

Consistent content height: When switching tabs, if one tab’s content is much taller, the sudden jump in content size can be jarring. Try to keep tab content areas roughly equal in size or use a fixed height container with scroll if necessary. Alternatively, disable the switching animation (animated=false) so it doesn’t slide/jump dramatically – instant switch might be cleaner in such cases.

State persistence: By default, switching away from a tab destroys its content (display-directive="if"), resetting any state in it. If you need to preserve state (e.g. user typed something in an input, or a video that was playing), either manage that state externally or use display-directive="show" on the panes so that inactive ones are just hidden but not unmounted. Be mindful that keeping all tabs mounted can be heavier if each has complex content (but usually fine for a few tabs).

Styling tabs: The default "bar" type will underline the active tab with the primary color. The "card" type makes tabs look like segmented buttons. Choose the style that fits your slide design. For a minimalist look (tabs as plain text switching content), "bar" is clean. For more prominent tabs (they look like buttons), use "card". If needed, you can customize with tabs-props on an NConfigProvider or override styles, but generally stick to built-in styles for consistency.

Keyboard navigation: Although by default tabs can be changed via click, ensure accessibility by letting keyboard users navigate. Naive UI Tabs support arrow key navigation between tabs when focused. Consider highlighting the fact, or at least ensure focus styles are visible. Provide aria labels if tab text isn’t sufficient (Naive UI handles basic ARIA roles for tabs list and tab items).