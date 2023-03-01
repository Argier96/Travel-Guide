import {useContext, useEffect, useState} from 'react';
import {MainContext} from '../contexts/MainContext';

import {
  appId,
  baseUrl,
  doFetch,
  HTTP_METHOD,
  mediaPath,
  searchPath,
  userPath,
} from '../utils';
import {useTag} from './useTag';

export const useMedia = (myFilesOnly) => {
  const [mediaArray, setMediaArray] = useState([]);
  const {update, user} = useContext(MainContext);

  const loadMedia = async () => {
    try {
      let json = await useTag().getFilesByTag(appId);

      if (myFilesOnly) {
        json = json.filter((file) => file.user_id === user.user_id);
      }

      json.reverse();
      const media = await Promise.all(
        json.map(async (file) => {
          const fileResponse = await fetch(baseUrl + mediaPath + file.file_id);
          return await fileResponse.json();
        })
      );
      setMediaArray(media);
    } catch (error) {
      console.error('List, loadMedia', error);
    }
  };
  useEffect(() => {
    loadMedia();
  }, [update]);

  const postMedia = async (fileData, token) => {
    const options = {
      method: HTTP_METHOD.POST,
      headers: {
        'x-access-token': token,
        'Content-Type': 'multipart/form-data',
      },
      body: fileData,
    };
    try {
      return await doFetch(baseUrl + mediaPath, options);
    } catch (error) {
      throw new Error('postMedia: ' + error.message);
    }
  };

  const deleteMedia = async (id, token) => {
    try {
      return await doFetch(baseUrl + mediaPath + id, {
        headers: {'x-access-token': token},
        method: HTTP_METHOD.DELETE,
      });
    } catch (error) {
      throw new Error('deleteMedia, ' + error.message);
    }
  };

  const putMedia = async (id, data, token) => {
    const options = {
      method: HTTP_METHOD.PUT,
      headers: {
        'x-access-token': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    };
    try {
      return await doFetch(baseUrl + mediaPath + id, options);
    } catch (error) {
      throw new Error('putMedia: ' + error.message);
    }
  };

  const getAllFilesOfUser = async (userId, token) => {
    const options = {
      method: HTTP_METHOD.GET,
      headers: {
        'x-access-token': token,
      },
    };

    try {
      return await doFetch(baseUrl + mediaPath + userPath + userId, options);
    } catch (error) {
      throw new Error('Error in getting files of a user: ' + error.message);
    }
  };

  const searchMedia = async (data, token) => {
    const options = {
      method: HTTP_METHOD.POST,
      headers: {
        'x-access-token': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    };
    try {
      return await doFetch(baseUrl + mediaPath + searchPath, options);
    } catch (error) {
      throw new Error('searchMedia: ' + error.message);
    }
  };

  return {
    mediaArray,
    postMedia,
    deleteMedia,
    putMedia,
    getAllFilesOfUser,
    searchMedia,
  };
};
