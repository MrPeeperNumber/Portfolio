//BackBlaze API
let lastAccess = 0;
const cacheTime = 60 * 60 * 1000 // 1 Hour Cache Time
const axios = require('axios');
const appKeyID = process.env.APP_KEY_ID;
const appKey = process.env.APP_KEY;
const bucketName = process.env.BUCKET_NAME;
let fileTree = {};
const encodedBase64 = Buffer.from(appKeyID + ':' + appKey).toString('base64');

// Retrieves bucket information and parses it into relevant data
const getResults = async () => {
	if (Date.now() >= lastAccess + cacheTime) {
		console.log("Refreshing bucket information");

		// gets the session information
		// expires after 24 hours
		const result = await axios.post(`https://api.backblazeb2.com/b2api/v2/b2_authorize_account`, {}, {
			headers: { Authorization: 'Basic ' + encodedBase64 }
		});

		const data = result.data;
		const credentials = {
			accountID: data.accountId,
			appKeyID: appKeyID,
			appKey: appKey,
			apiUrl: data.apiUrl,
			authorizationToken: data.authorizationToken,
			downloadUrl: data.downloadUrl,
			recommendedPartSize: data.recommendedPartSize
		};

		// gets a list of buckets from the database
		const bucketList = await axios.post(`${credentials.apiUrl}/b2api/v2/b2_list_buckets`, 
		{
			accountId: credentials.accountID,
			bucketTypes: ["allPrivate", "allPublic"]
		},
		{	headers: { Authorization: credentials.authorizationToken } });

		// there should only be one bucket
		const bucket = bucketList.data.buckets.find((element) => element.bucketName === bucketName );
		if( bucket == null ) throw new Error("Unable to find bucket");

		// gets the names of all the folders in the buckets
		const foldersResults = await axios.post(`${credentials.apiUrl}/b2api/v2/b2_list_file_names`,
		{
			bucketId: bucket.bucketId,
			prefix: "",
			delimiter: "/"
		},
		{	headers: { Authorization: credentials.authorizationToken } });
		
		// gets the paths of all the files in the bucket
		const filesResults = await axios.post(`${credentials.apiUrl}/b2api/v2/b2_list_file_names`,
		{
			bucketId: bucket.bucketId
		},
		{	headers: { Authorization: credentials.authorizationToken } });

		// creates an array of download URLs for all the images
		fileTree = {};
		filesResults.data.files.forEach(element => {
			let fileNameParts = element.fileName.split("/");

			if( !(fileNameParts[0] in fileTree) ) {
				fileTree[fileNameParts[0]] = [];
			}
			else {
				fileTree[fileNameParts[0]].push(`https://media.jakeroberts.me/file/${bucketName}/${element.fileName}`);
			}
		});

		lastAccess = Date.now()
	}

	// console.log(fileTree);
	return fileTree;
};

exports.getResults = getResults;
exports.fileTree = fileTree;