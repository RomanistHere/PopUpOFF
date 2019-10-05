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

export {
	ARR_OF_FORB_SITES,
	ARR_OF_CONTENT_ITEMS,
	ARR_OF_TAG_ITEMS,
}