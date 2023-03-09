// import {doFetch} from '../utils/apiUtils/doFetch';
// import {baseUrl} from '../utils/variables';
import {baseUrl, doFetch, filePath, HTTP_METHOD, tagPath} from '../utils';

export const useTag = () => {
  const getFilesByTag = async (tag) => {
    try {
      return await doFetch(baseUrl + tagPath + tag);
    } catch (error) {
      throw new Error('getFilesByTag, ' + error.message);
    }
  };
  const getTagsOfFile = async (id) => {
    try {
      return await doFetch(baseUrl + tagPath + filePath + id);
    } catch (error) {
      throw new Error('gerTagsOfFile, ' + error.message);
    }
  };

  const postTag = async (data, token) => {
    const options = {
      method: HTTP_METHOD.POST,
      headers: {
        'x-access-token': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    };
    try {
      return await doFetch(baseUrl + tagPath, options);
    } catch (error) {
      throw new Error('postTag: ' + error.message);
    }
  };
  return {getFilesByTag, getTagsOfFile, postTag};
};
