// Shared validation for the item-photo upload forms (ReportLostItem, ReportFoundItem).
//
// Browsers don't always report a reliable `file.type` (MIME type) for every
// format - on some OS/browser combinations, .webp files come back with an
// empty file.type because the OS's registered MIME database doesn't know
// about webp. Checking the file extension as a fallback avoids valid photos
// getting rejected as "unsupported format" just because of that gap.
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

export function isAllowedImageFile(file) {
  if (ALLOWED_MIME_TYPES.includes(file.type)) return true;

  const dotIndex = file.name.lastIndexOf('.');
  if (dotIndex === -1) return false;
  const ext = file.name.slice(dotIndex).toLowerCase();
  return ALLOWED_EXTENSIONS.includes(ext);
}

// Used on the <input type="file" accept="..."> attribute. Including the
// extensions alongside the MIME types helps some file pickers (which also
// rely on the OS's MIME registry) show .webp files as selectable at all.
export const IMAGE_ACCEPT_ATTR = 'image/jpeg,image/jpg,image/png,image/webp,.jpg,.jpeg,.png,.webp';
