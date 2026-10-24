import { Post, Comment } from '../types/blog';

/**
 * Universal Google Apps Script Web App Template with Enterprise-Grade Server-Side Security:
 * 
 * 1. ZERO SECRETS IN CLIENT:
 *    The passkey is stored securely on Google's cloud servers in ScriptProperties,
 *    never in the GitHub repository or browser localStorage.
 * 2. BRUTE-FORCE RATE LIMITING:
 *    Uses Google's CacheService to enforce a maximum of 5 failed attempts,
 *    followed by an automatic 15-minute server-side lockout.
 * 3. SERVER-AUTHORITATIVE PERMISSIONS:
 *    Even if someone modifies client JavaScript, Google Sheets rejects all post creation/deletion
 *    unless the server-side passkey matches.
 */
export const APPS_SCRIPT_TEMPLATE = `/**
 * Google Apps Script Backend for InkSheet GitHub Pages Blog
 * 
 * SETUP INSTRUCTIONS:
 * 1. In your Google Sheet, click 'Extensions' > 'Apps Script'.
 * 2. Delete existing code and paste this entire script.
 * 3. Change YOUR_SECRET_PASSKEY below to your chosen secret password.
 *    (Or configure it in Project Settings > Script Properties as 'ADMIN_PASSKEY')
 * 4. Click 'Deploy' > 'New deployment'
 *    - Type: 'Web app'
 *    - Execute as: 'Me' (Your Google Account)
 *    - Who has access: 'Anyone' (Allows public readers to read posts & leave comments)
 * 5. Click 'Deploy' and copy the Web App URL into your blog settings!
 */

// Secret passkey stored exclusively on Google's servers - NEVER exposed to the frontend!
var DEFAULT_PASSKEY = "change_me_to_your_secure_password";

function getMasterPasskey() {
  var prop = PropertiesService.getScriptProperties().getProperty('ADMIN_PASSKEY');
  return prop ? prop : DEFAULT_PASSKEY;
}

// Anti-Brute-Force Rate Limiting using Google CacheService
function checkRateLimit(key) {
  var cache = CacheService.getScriptCache();
  var attempts = parseInt(cache.get(key) || "0", 10);
  if (attempts >= 5) {
    return false; // Locked out!
  }
  return true;
}

function recordFailedAttempt(key) {
  var cache = CacheService.getScriptCache();
  var attempts = parseInt(cache.get(key) || "0", 10) + 1;
  cache.put(key, attempts.toString(), 900); // 15-minute lockout (900 seconds)
  return 5 - attempts;
}

function clearRateLimit(key) {
  var cache = CacheService.getScriptCache();
  cache.remove(key);
}

function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var action = (e && e.parameter && e.parameter.action) || 'getPosts';
  var result = [];

  try {
    if (action === 'getPosts') {
      var sheet = ss.getSheetByName('Posts') || setupPostsSheet(ss);
      result = readSheetRows(sheet);
    } else if (action === 'getComments') {
      var sheet = ss.getSheetByName('Comments') || setupCommentsSheet(ss);
      var postId = e.parameter.postId;
      var allComments = readSheetRows(sheet);
      result = postId ? allComments.filter(function(c) { return c.postId === postId; }) : allComments;
    }

    return respondJSON({ success: true, data: result });
  } catch (err) {
    return respondJSON({ success: false, error: err.toString() });
  }
}

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var payload = JSON.parse(e.postData.contents);
    var action = payload.action;
    var masterKey = getMasterPasskey();
    var rateLimitKey = "lockout_attempts";

    // 1. Author Passkey Verification with Server-Side Rate Limiting
    if (action === 'verifyPasskey') {
      if (!checkRateLimit(rateLimitKey)) {
        return respondJSON({ 
          success: false, 
          error: "Too many failed attempts. Server-side lockout active for 15 minutes to prevent brute-forcing." 
        });
      }

      var provided = (payload.passkey || "").trim();
      if (provided === masterKey) {
        clearRateLimit(rateLimitKey);
        // Generate a cryptographically random session token valid for 24 hours
        var sessionToken = Utilities.getUuid();
        CacheService.getScriptCache().put("session_" + sessionToken, "valid", 86400);
        return respondJSON({ success: true, sessionToken: sessionToken });
      } else {
        var remaining = recordFailedAttempt(rateLimitKey);
        return respondJSON({ 
          success: false, 
          error: "Incorrect passkey. " + (remaining > 0 ? remaining + " attempt(s) remaining before 15-min lockout." : "Account locked for 15 minutes.")
        });
      }
    }

    // 2. Submit Reader Comment (No passkey required for readers)
    if (action === 'addComment') {
      var cSheet = ss.getSheetByName('Comments') || setupCommentsSheet(ss);
      cSheet.appendRow([
        payload.id || Utilities.getUuid(),
        payload.postId,
        payload.authorName || 'Anonymous Reader',
        payload.authorEmail || '',
        payload.comment || '',
        new Date().toISOString()
      ]);
      return respondJSON({ success: true, message: 'Comment saved' });
    }

    // 3. Reader Newsletter Subscribe (No passkey required for readers)
    if (action === 'subscribe') {
      var sSheet = ss.getSheetByName('Subscribers') || setupSubscribersSheet(ss);
      sSheet.appendRow([
        Utilities.getUuid(),
        payload.email,
        new Date().toISOString()
      ]);
      return respondJSON({ success: true, message: 'Subscribed' });
    }

    // 4. Save or Update Post (Author Action: Strictly validated on server)
    if (action === 'savePost') {
      var validSession = payload.sessionToken && CacheService.getScriptCache().get("session_" + payload.sessionToken) === "valid";
      var validDirectKey = (payload.passkey || "").trim() === masterKey;

      if (!validSession && !validDirectKey) {
        return respondJSON({ success: false, error: 'Unauthorized: Valid author passkey required.' });
      }

      var pSheet = ss.getSheetByName('Posts') || setupPostsSheet(ss);
      var p = payload.post;
      var data = pSheet.getDataRange().getValues();
      var rowIndex = -1;

      for (var i = 1; i < data.length; i++) {
        if (data[i][0] == p.id) {
          rowIndex = i + 1;
          break;
        }
      }

      var rowValues = [
        p.id,
        p.title,
        p.subtitle || '',
        p.slug || '',
        p.content || '',
        p.author || 'Author',
        p.authorEmail || '',
        p.authorAvatar || '',
        p.coverImage || '',
        Array.isArray(p.tags) ? JSON.stringify(p.tags) : (p.tags || '[]'),
        p.status || 'published',
        p.publishedAt || new Date().toISOString(),
        new Date().toISOString(),
        p.likesCount || 0,
        p.readTimeMinutes || 3
      ];

      if (rowIndex > 0) {
        pSheet.getRange(rowIndex, 1, 1, rowValues.length).setValues([rowValues]);
      } else {
        pSheet.appendRow(rowValues);
      }

      return respondJSON({ success: true, message: 'Post saved successfully' });
    }

    // 5. Delete Post (Author Action: Strictly validated on server)
    if (action === 'deletePost') {
      var validSessionDel = payload.sessionToken && CacheService.getScriptCache().get("session_" + payload.sessionToken) === "valid";
      var validDirectKeyDel = (payload.passkey || "").trim() === masterKey;

      if (!validSessionDel && !validDirectKeyDel) {
        return respondJSON({ success: false, error: 'Unauthorized: Valid author passkey required.' });
      }

      var pSheet = ss.getSheetByName('Posts');
      if (pSheet) {
        var data = pSheet.getDataRange().getValues();
        for (var i = 1; i < data.length; i++) {
          if (data[i][0] == payload.postId) {
            pSheet.deleteRow(i + 1);
            break;
          }
        }
      }
      return respondJSON({ success: true, message: 'Post deleted' });
    }

    return respondJSON({ success: false, error: 'Unknown action requested' });
  } catch (err) {
    return respondJSON({ success: false, error: err.toString() });
  }
}

function respondJSON(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function readSheetRows(sheet) {
  if (!sheet) return [];
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  var headers = data[0];
  var rows = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = row[j];
    }
    if (obj.tags && typeof obj.tags === 'string' && obj.tags.indexOf('[') === 0) {
      try { obj.tags = JSON.parse(obj.tags); } catch(e) {}
    } else if (typeof obj.tags === 'string') {
      obj.tags = obj.tags.split(',').map(function(t) { return t.trim(); }).filter(Boolean);
    }
    rows.push(obj);
  }
  return rows;
}

function setupPostsSheet(ss) {
  var s = ss.insertSheet('Posts');
  s.appendRow([
    'id', 'title', 'subtitle', 'slug', 'content', 'author', 'authorEmail',
    'authorAvatar', 'coverImage', 'tags', 'status', 'publishedAt', 'updatedAt',
    'likesCount', 'readTimeMinutes'
  ]);
  s.getRange(1, 1, 1, 15).setFontWeight('bold').setBackground('#f3f3f3');
  return s;
}

function setupCommentsSheet(ss) {
  var s = ss.insertSheet('Comments');
  s.appendRow(['id', 'postId', 'authorName', 'authorEmail', 'comment', 'createdAt']);
  s.getRange(1, 1, 1, 6).setFontWeight('bold').setBackground('#f3f3f3');
  return s;
}

function setupSubscribersSheet(ss) {
  var s = ss.insertSheet('Subscribers');
  s.appendRow(['id', 'email', 'subscribedAt']);
  s.getRange(1, 1, 1, 3).setFontWeight('bold').setBackground('#f3f3f3');
  return s;
}
`;

/**
 * Verifies author passkey against Google Apps Script server
 * Server enforces 5-attempt rate limit and returns cryptographic session token.
 */
export async function verifyPasskeyViaAppsScript(
  appsScriptUrl: string, 
  passkey: string
): Promise<{ success: boolean; sessionToken?: string; error?: string }> {
  try {
    const res = await fetch(appsScriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'verifyPasskey',
        passkey: passkey.trim()
      })
    });
    return await res.json();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Network failure';
    return { success: false, error: `Failed to contact backend: ${msg}` };
  }
}

/**
 * Fetch articles from Google Apps Script Web App
 */
export async function fetchPostsViaAppsScript(appsScriptUrl: string): Promise<Post[]> {
  const url = new URL(appsScriptUrl);
  url.searchParams.set('action', 'getPosts');
  
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Apps Script responded with HTTP ${res.status}`);
  const json = await res.json();
  return json.data || [];
}

/**
 * Save / publish post via Google Apps Script Web App
 */
export async function savePostViaAppsScript(
  appsScriptUrl: string, 
  post: Post, 
  authPayload: { sessionToken?: string; passkey?: string }
): Promise<boolean> {
  const res = await fetch(appsScriptUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({
      action: 'savePost',
      post,
      sessionToken: authPayload.sessionToken,
      passkey: authPayload.passkey
    })
  });
  const data = await res.json().catch(() => ({ success: true }));
  if (!data.success) {
    throw new Error(data.error || 'Failed to save post to backend');
  }
  return true;
}

/**
 * Delete post via Google Apps Script Web App
 */
export async function deletePostViaAppsScript(
  appsScriptUrl: string, 
  postId: string, 
  authPayload: { sessionToken?: string; passkey?: string }
): Promise<boolean> {
  const res = await fetch(appsScriptUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({
      action: 'deletePost',
      postId,
      sessionToken: authPayload.sessionToken,
      passkey: authPayload.passkey
    })
  });
  const data = await res.json().catch(() => ({ success: true }));
  if (!data.success) {
    throw new Error(data.error || 'Failed to delete post from backend');
  }
  return true;
}

/**
 * Fetch comments from Google Apps Script Web App
 */
export async function fetchCommentsViaAppsScript(appsScriptUrl: string, postId?: string): Promise<Comment[]> {
  const url = new URL(appsScriptUrl);
  url.searchParams.set('action', 'getComments');
  if (postId) url.searchParams.set('postId', postId);

  const res = await fetch(url.toString());
  if (!res.ok) return [];
  const json = await res.json().catch(() => ({ data: [] }));
  return json.data || [];
}

/**
 * Submit reader comment via Google Apps Script Web App (No authentication needed for readers)
 */
export async function submitCommentViaAppsScript(appsScriptUrl: string, comment: Comment): Promise<boolean> {
  const res = await fetch(appsScriptUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({
      action: 'addComment',
      ...comment
    })
  });
  const data = await res.json().catch(() => ({ success: true }));
  return data.success !== false;
}

/**
 * Subscribe email via Google Apps Script Web App
 */
export async function subscribeViaAppsScript(appsScriptUrl: string, email: string): Promise<boolean> {
  const res = await fetch(appsScriptUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({
      action: 'subscribe',
      email
    })
  });
  const data = await res.json().catch(() => ({ success: true }));
  return data.success !== false;
}

/**
 * Read-only fetch from a Public Google Sheet via Google Visualization API
 */
export async function fetchPostsFromPublicSheet(spreadsheetId: string): Promise<Post[]> {
  const url = `https://docs.google.com/spreadsheets/d/${encodeURIComponent(spreadsheetId)}/gviz/tq?tqx=out:json&sheet=Posts`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Google Sheet returned HTTP ${res.status}`);
  
  const text = await res.text();
  const jsonStr = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
  const data = JSON.parse(jsonStr);

  const rows = data.table?.rows || [];
  return rows.map((r: any) => {
    const c = r.c || [];
    const val = (idx: number) => c[idx]?.v ?? '';

    let tags: string[] = [];
    try {
      const tagStr = val(9);
      if (tagStr.startsWith('[')) {
        tags = JSON.parse(tagStr);
      } else if (tagStr) {
        tags = tagStr.split(',').map((s: string) => s.trim());
      }
    } catch {
      tags = [];
    }

    return {
      id: val(0) || `post-${Date.now()}`,
      title: val(1) || 'Untitled',
      subtitle: val(2) || '',
      slug: val(3) || '',
      content: val(4) || '',
      author: val(5) || 'Author',
      authorEmail: val(6) || '',
      authorAvatar: val(7) || '',
      coverImage: val(8) || '',
      tags,
      status: (val(10) === 'draft' ? 'draft' : 'published') as 'draft' | 'published',
      publishedAt: val(11) || new Date().toISOString(),
      updatedAt: val(12) || new Date().toISOString(),
      likesCount: parseInt(val(13) || '0', 10) || 0,
      readTimeMinutes: parseInt(val(14) || '3', 10) || 3
    };
  });
}
