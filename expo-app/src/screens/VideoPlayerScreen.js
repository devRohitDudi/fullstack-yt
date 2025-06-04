import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Video from 'react-native-video';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const VideoPlayerScreen = ({ route, navigation }) => {
  const { video } = route.params;
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    fetchComments();
    checkLikeStatus();
  }, []);

  const fetchComments = async () => {
    try {
      const response = await axios.get(
        `http://localhost:4000/api/v1/videos/${video._id}/comments`
      );
      setComments(response.data.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const checkLikeStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.get(
        `http://localhost:4000/api/v1/videos/${video._id}/like-status`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setLiked(response.data.liked);
    } catch (error) {
      console.error('Error checking like status:', error);
    }
  };

  const handleLike = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      await axios.post(
        `http://localhost:4000/api/v1/videos/${video._id}/like`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setLiked(!liked);
    } catch (error) {
      console.error('Error liking video:', error);
    }
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;

    try {
      const token = await AsyncStorage.getItem('userToken');
      await axios.post(
        `http://localhost:4000/api/v1/videos/${video._id}/comments`,
        { content: commentText },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCommentText('');
      fetchComments();
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Video
        source={{ uri: video.videoFile }}
        style={styles.video}
        resizeMode="contain"
        onLoad={() => setLoading(false)}
        controls
      />
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      )}

      <ScrollView style={styles.content}>
        <View style={styles.videoInfo}>
          <Text style={styles.title}>{video.title}</Text>
          <View style={styles.statsContainer}>
            <Text style={styles.stats}>
              {video.views} views • {new Date(video.createdAt).toLocaleDateString()}
            </Text>
          </View>

          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleLike}
            >
              <Ionicons
                name={liked ? 'heart' : 'heart-outline'}
                size={24}
                color={liked ? '#ef4444' : '#fff'}
              />
              <Text style={styles.actionText}>Like</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>Comments</Text>
          {comments.map((comment) => (
            <View key={comment._id} style={styles.comment}>
              <Text style={styles.commentUsername}>{comment.owner.username}</Text>
              <Text style={styles.commentText}>{comment.content}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#18181b',
  },
  video: {
    width: width,
    height: width * 0.5625,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
  },
  videoInfo: {
    padding: 16,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stats: {
    color: '#71717a',
    fontSize: 14,
  },
  actionsContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#27272a',
    paddingTop: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  actionText: {
    color: '#fff',
    marginLeft: 8,
  },
  commentsSection: {
    padding: 16,
  },
  commentsTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  comment: {
    marginBottom: 16,
  },
  commentUsername: {
    color: '#fff',
    fontWeight: '600',
    marginBottom: 4,
  },
  commentText: {
    color: '#a1a1aa',
  },
});

export default VideoPlayerScreen; 