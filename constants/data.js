const ARR_OF_FORB_SITES = [
	'music.youtube.com',
	'www.youtube.com',
	'www.linkedin.com',
	'twitter.com',
	'www.facebook.com',
	'www.google.com',
	'www.reddit.com',
	'www.instagram.com',
	'www.baidu.com',
	'www.amazon.com',
	'vk.com',
	'www.pinterest.com',
	'trello.com',
	'calendar.google.com',
	'drive.google.com',
	'docs.google.com',
	'support.google.com',
	'cloud.google.com',
	'about.google',
	'mail.google.com',
	'hangouts.google.com',
	'www.walmart.com',
	'open.spotify.com',
	'www.reddit.com',
	'www.bing.com',
	'www.spotify.com',
	'zoom.us',
	'www.netflix.com',
]
// words for block when easy mode
const ARR_OF_CONTENT_ITEMS = [
	'policy', 
	'cookie', 
	'subscription', 
	'subscribe', 
	'off', 
	'sale', 
	'notification', 
	'notifications', 
	'updates', 
	'privacy', 
	'miss'
]
// tags not to block when easy mode
const ARR_OF_TAG_ITEMS = [
	'<nav', 
	'<header', 
	'search', 
	'ytmusic', 
	'searchbox', 
	'app-drawer'
]
// useful info
const emailUrl = 'mailto:romanisthere@gmail.com'

export {
	ARR_OF_FORB_SITES,
	ARR_OF_CONTENT_ITEMS,
	ARR_OF_TAG_ITEMS,
	emailUrl,
}