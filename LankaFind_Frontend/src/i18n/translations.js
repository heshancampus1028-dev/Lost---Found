// All translatable UI strings live here, keyed by a short id.
// Add a new key here (with both `en` and `si` values) whenever you add new UI text.
const translations = {
  // Navbar
  navLost: { en: 'Lost Items', si: 'නැති වූ දේ' },
  navFound: { en: 'Found Items', si: 'හමු වූ දේ' },
  navMyReports: { en: 'My Reports', si: 'මගේ වාර්තා' },
  navLogin: { en: 'Login', si: 'ඇතුල් වන්න' },
  navLogout: { en: 'Logout', si: 'ඉවත් වන්න' },
  navGreeting: { en: 'Hi', si: 'ආයුබෝවන්' },

  // Footer
  footerTagline: { en: 'Reuniting Sri Lanka with what it lost.', si: 'නැති වූ දේ නැවත හිමිකරුට.' },
  footerRights: { en: 'All rights reserved.', si: 'සියලුම හිමිකම් ඇවිරිණි.' },

  // Home page
  homeWelcome: { en: 'Welcome to', si: 'සාදරයෙන් පිළිගනිමු' },
  homeSubtitle: {
    en: "Sri Lanka's most trusted platform for lost and found items. Did you lose something or find a misplaced item? Select an option below.",
    si: 'ශ්‍රී ලංකාවේ නැතිවූ සහ හමුවූ දේ සොයා දෙන විශ්වාසවන්තම වේදිකාව. ඔබට යමක් නැතිවුණාද, නැත්නම් යමක් හම්බුවුණාද? පහත විකල්පයක් තෝරන්න.',
  },
  homeLostCardTitle: { en: 'Lost Items', si: 'නැති වූ දේ' },
  homeLostCardDesc: {
    en: 'Lost something? Add the details and publish a report right away.',
    si: 'ඔබේ යම් දෙයක් නැති වුනාද? විස්තර ඇතුළත් කර දැන්ම වාර්තාවක් පළ කරන්න.',
  },
  homeLostCardCta: { en: 'Search / Report Lost Item →', si: 'සොයන්න / නැති වූ දේ වාර්තා කරන්න →' },
  homeFoundCardTitle: { en: 'Found Items', si: 'හමු වූ දේ' },
  homeFoundCardDesc: {
    en: "Found someone's item? Help reunite it with its owner.",
    si: 'කාගේ හෝ දෙයක් ඔබට හම්බුවුණාද? එහි අයිතිකරුට එය ලබා දෙන්න උදව් කරන්න.',
  },
  homeFoundCardCta: { en: 'Report Found Item →', si: 'හමු වූ දෙය වාර්තා කරන්න →' },
  homeFeedTitle: { en: 'Recent Bulletin Feed 🇱🇰', si: 'මෑත වාර්තා 🇱🇰' },
  homeFeedSubtitle: { en: 'Real-time updates of lost and found reports.', si: 'නැති වූ සහ හමු වූ වාර්තාවල නවතම යාවත්කාලීන කිරීම්.' },
  statusAll: { en: 'All', si: 'සියල්ල' },
  statusLost: { en: '🛑 Lost', si: '🛑 නැති වූ' },
  statusFound: { en: '✅ Found', si: '✅ හමු වූ' },
  loadingItems: { en: 'Loading items... 🔄', si: 'අයිතමයන් පූරණය වෙමින්... 🔄' },
  noItemsMatch: { en: '📍 No matching items found.', si: '📍 ගැලපෙන අයිතමයක් හම්බුනේ නෑ.' },

  // Lost / Found pages
  reportLostTitle: { en: '🚨 Report a Lost Item', si: '🚨 නැති වූ දෙයක් වාර්තා කරන්න' },
  reportFoundTitle: { en: '✅ Report a Found Item', si: '✅ හමු වූ දෙයක් වාර්තා කරන්න' },
  loginToReportPrompt: { en: 'Please log in first to publish a report.', si: 'වාර්තාවක් පළ කිරීමට මුලින්ම ඇතුල් වන්න.' },
  labelItemTitle: { en: 'Item Title *', si: 'අයිතමයේ නම *' },
  placeholderLostTitle: { en: 'e.g., Black Backpack', si: 'උදා: කළු බෑග් එකක්' },
  placeholderFoundTitle: { en: 'e.g., Car Key', si: 'උදා: කාර් යතුරක්' },
  labelCategory: { en: 'Category *', si: 'වර්ගය *' },
  selectCategory: { en: 'Select Category', si: 'වර්ගය තෝරන්න' },
  categoryElectronics: { en: 'Electronics', si: 'ඉලෙක්ට්‍රොනික උපකරණ' },
  categoryDocuments: { en: 'Documents & Cards', si: 'ලේඛන සහ කාඩ්පත්' },
  categoryPersonalItems: { en: 'Personal Items (Wallet/Bag)', si: 'පෞද්ගලික වස්තු (පසුම්බිය/බෑගය)' },
  categoryKeys: { en: 'Keys', si: 'යතුරු' },
  categoryOther: { en: 'Other', si: 'වෙනත්' },
  labelLostLocation: { en: 'Last Known Location *', si: 'අවසන් වරට දුටු ස්ථානය *' },
  labelFoundLocation: { en: 'Found Location *', si: 'හමු වූ ස්ථානය *' },
  placeholderLostLocation: { en: 'e.g., Kandy Bus Stand', si: 'උදා: මහනුවර බස් නැවතුම්පොළ' },
  placeholderFoundLocation: { en: 'e.g., Majestic City', si: 'උදා: මැජෙස්ටික් සිටි' },
  labelContact: { en: 'Contact Number *', si: 'දුරකථන අංකය *' },
  placeholderContact: { en: 'e.g., 0771234567', si: 'උදා: 0771234567' },
  labelDescription: { en: 'Description', si: 'විස්තරය' },
  placeholderLostDescription: { en: 'Provide details (color, brand, unique marks)...', si: 'විස්තර සපයන්න (වර්ණය, බ්‍රෑන්ඩ් එක, විශේෂ සලකුණු)...' },
  placeholderFoundDescription: { en: 'Where is it now? How can the owner contact you or get it back?', si: 'දැන් එය කොහෙද තියෙන්නේ? අයිතිකරුට එය ලබා ගන්නේ කෙසේද?' },
  publishReport: { en: 'Publish Report', si: 'වාර්තාව පළ කරන්න' },
  loginToPublish: { en: 'Login to Publish', si: 'පළ කිරීමට ඇතුල් වන්න' },
  recentLostReports: { en: 'Recent Lost Reports', si: 'මෑත නැති වූ වාර්තා' },
  recentLostSubtitle: { en: 'Help others find their misplaced belongings.', si: 'අන් අයගේ නැති වූ දේ සොයා ගැනීමට උදව් කරන්න.' },
  recentFoundReports: { en: 'Recent Found Reports', si: 'මෑත හමු වූ වාර්තා' },
  recentFoundSubtitle: { en: 'Help return these items to their rightful owners.', si: 'මෙම දේ නියම අයිතිකරුවන්ට ලබා දීමට උදව් කරන්න.' },
  noLostMatch: { en: '📍 No matching lost reports found.', si: '📍 ගැලපෙන නැති වූ වාර්තාවක් හම්බුනේ නෑ.' },
  noFoundMatch: { en: '📍 No matching found reports found.', si: '📍 ගැලපෙන හමු වූ වාර්තාවක් හම්බුනේ නෑ.' },
  sessionExpired: { en: 'Your session has expired, please log in again!', si: 'ඔබගේ session එක කල් ඉකුත් වී ඇත, නැවත ඇතුල් වන්න!' },
  postFailed: { en: 'Could not submit the item. Please try again!', si: 'අයිතමය ඇතුළත් කිරීමට නොහැකි විය. නැවත උත්සාහ කරන්න!' },

  // Standalone Report Lost/Found pages
  backToLostItems: { en: '← Back to Lost Items', si: '← නැති වූ දේ වෙත ආපසු' },
  backToFoundItems: { en: '← Back to Found Items', si: '← හමු වූ දේ වෙත ආපසු' },
  viewLostItems: { en: 'View Lost Items', si: 'නැති වූ දේ බලන්න' },
  viewFoundItems: { en: 'View Found Items', si: 'හමු වූ දේ බලන්න' },
  mapPinHint: { en: '📍 Optional: click the map below to pin the exact spot', si: '📍 විකල්පයකි: නිශ්චිත ස්ථානය සලකුණු කිරීමට පහත සිතියම මත ක්ලික් කරන්න' },
  labelPhoto: { en: 'Photo (optional, up to 3)', si: 'ඡායාරූපය (විකල්පයකි, උපරිම 3ක්)' },
  optional: { en: 'optional', si: 'විකල්පයකි' },
  noContactProvided: { en: 'No contact number provided', si: 'දුරකථන අංකයක් ලබා දී නැත' },

  // Found-item verification question
  labelVerificationQuestion: { en: 'Verification Question (optional)', si: 'තහවුරු කිරීමේ ප්‍රශ්නය (විකල්පයකි)' },
  placeholderVerificationQuestion: { en: "e.g. What's inside the wallet?", si: 'උදා: පසුම්බිය ඇතුළේ මොනවද තියෙන්නේ?' },
  verificationHint: {
    en: 'If set, claimants must answer this correctly before they see your contact info.',
    si: 'මෙය සකසා ඇත්නම්, ඔබගේ දුරකථන අංකය බැලීමට පෙර හිමිකම් කියන්නා මෙයට නිවැරදිව පිළිතුරු දිය යුතුය.',
  },
  labelCorrectAnswer: { en: 'Correct Answer', si: 'නිවැරදි පිළිතුර' },
  placeholderCorrectAnswer: { en: 'Only you will know this', si: 'මෙය දන්නේ ඔබට පමණි' },

  // Edit Report modal
  editBtn: { en: 'Edit', si: 'සංස්කරණය' },
  editReportTitle: { en: 'Edit Report', si: 'වාර්තාව සංස්කරණය කරන්න' },
  fillRequiredFields: { en: 'Please fill in the required fields.', si: 'අවශ්‍ය කරන ක්ෂේත්‍ර පුරවන්න.' },
  cancelBtn: { en: 'Cancel', si: 'අවලංගු කරන්න' },
  savingBtn: { en: 'Saving...', si: 'සුරකිමින්...' },
  saveChangesBtn: { en: 'Save Changes', si: 'වෙනස්කම් සුරකින්න' },
  leaveBlankToKeep: { en: 'Leave blank to keep the current answer', si: 'වත්මන් පිළිතුර තබා ගැනීමට හිස්ව තබන්න' },
  leaveBlankHint: {
    en: 'Leave this empty to keep the previously saved answer.',
    si: 'කලින් සුරැකූ පිළිතුර තබා ගැනීමට මෙය හිස්ව තබන්න.',
  },

  // Auto-match suggestions
  checkMatches: { en: '🔍 Check possible matches', si: '🔍 ගැලපෙන දේ පරීක්ෂා කරන්න' },
  possibleMatchesFound: { en: '✨ Possible matches found', si: '✨ ගැලපෙන දේ හම්බුනා' },
  noMatchesFound: { en: 'No matches found yet.', si: 'තවම ගැලපෙන දෙයක් හම්බුනේ නෑ.' },

  // Messaging
  sendMessage: { en: '💬 Message', si: '💬 පණිවිඩය' },

  // Search / Filter
  searchPlaceholder: { en: 'Search by title or location...', si: 'නම හෝ ස්ථානය අනුව සොයන්න...' },
  allCategories: { en: 'All Categories', si: 'සියලුම වර්ග' },

  // Login page
  welcomeBack: { en: 'Welcome Back', si: 'ආයුබෝවන්, නැවත සාදරයෙන් පිළිගනිමු' },
  loginSubtitle: { en: 'Log in to manage your reports and connect with owners', si: 'ඔබගේ වාර්තා කළමනාකරණය කර අයිතිකරුවන් සමඟ සම්බන්ධ වීමට ඇතුල් වන්න' },
  labelEmail: { en: 'Email Address', si: 'ඊමේල් ලිපිනය' },
  labelPassword: { en: 'Password', si: 'මුරපදය' },
  signIn: { en: 'Sign In', si: 'ඇතුල් වන්න' },
  noAccount: { en: "Don't have an account?", si: 'ගිණුමක් නැද්ද?' },
  registerHere: { en: 'Register here', si: 'මෙතනින් ලියාපදිංචි වන්න' },
  serverErrorRetry: { en: 'A server error occurred, please try again later!', si: 'සර්වර් දෝෂයක් ඇතිවිය, පසුව උත්සාහ කරන්න!' },

  // Register page
  createAccount: { en: 'Create an Account', si: 'ගිණුමක් සාදන්න' },
  registerSubtitle: { en: 'Join LankaFind and start helping your community', si: 'LankaFind එකට එකතු වී ඔබේ ප්‍රජාවට උදව් කිරීම ආරම්භ කරන්න' },
  labelFullName: { en: 'Full Name', si: 'සම්පූර්ණ නම' },
  createAccountBtn: { en: 'Create Account', si: 'ගිණුම සාදන්න' },
  haveAccount: { en: 'Already have an account?', si: 'දැනටමත් ගිණුමක් තිබේද?' },
  loginHere: { en: 'Login here', si: 'මෙතනින් ඇතුල් වන්න' },

  // My Reports page
  myReportsTitle: { en: 'My Reports 📋', si: 'මගේ වාර්තා 📋' },
  myReportsSubtitle: { en: 'Manage the lost/found reports you have posted here.', si: 'ඔබ පළ කළ නැති වූ/හමු වූ වාර්තා මෙතන කළමනාකරණය කරන්න.' },
  noReportsYet: { en: '📍 You have not posted any reports yet.', si: '📍 ඔබ තවම කිසිම වාර්තාවක් පළ කර නැත.' },
  activeReports: { en: 'Active', si: 'ක්‍රියාකාරී' },
  resolvedReports: { en: 'Resolved', si: 'විසඳූ' },
  noActiveReports: { en: 'No active reports.', si: 'ක්‍රියාකාරී වාර්තා නැත.' },
  markResolved: { en: 'Mark Resolved', si: 'විසඳුනා ලෙස සලකුණු කරන්න' },
  markUnresolved: { en: 'Mark Unresolved', si: 'විසඳා නැති ලෙස සලකුණු කරන්න' },
  deleteBtn: { en: 'Delete', si: 'මකන්න' },
  confirmDelete: { en: 'Are you sure you want to delete this report? This cannot be undone.', si: 'මෙම වාර්තාව මැකීමට අවශ්‍ය බව විශ්වාසද? මෙය ආපසු හැරවිය නොහැක.' },
  updateFailed: { en: 'Could not update. Please try again!', si: 'යාවත්කාලීන කිරීමට නොහැකි විය. නැවත උත්සාහ කරන්න!' },
  deleteFailed: { en: 'Could not delete. Please try again!', si: 'මැකීමට නොහැකි විය. නැවත උත්සාහ කරන්න!' },
  loadReportsFailed: { en: 'Could not load your reports.', si: 'ඔබගේ වාර්තා පූරණය කිරීමට නොහැකි විය.' },

  // Item card
  badgeLost: { en: '🛑 LOST', si: '🛑 නැති වූ' },
  badgeFound: { en: '✅ FOUND', si: '✅ හමු වූ' },
  badgeResolved: { en: '✔️ Resolved', si: '✔️ විසඳුනා' },
  generateQRPoster: { en: '🖨️ Generate QR Poster', si: '🖨️ QR පෝස්ටරය සාදන්න' },
  backToLankaFind: { en: '← Back to LankaFind', si: '← LankaFind වෙත ආපසු' },
};

export default translations;
