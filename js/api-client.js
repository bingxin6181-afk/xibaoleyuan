/**
 * 戏胞乐园 - API 客户端
 * 从 Cloudflare Worker API 获取数据
 */

const API_BASE = 'https://damp-haze-d68b.bingxin6181.workers.dev';

// 数据缓存
let dataCache = null;
let cacheTime = 0;
const CACHE_DURATION = 60000; // 1分钟缓存

// 获取所有数据
async function fetchAllData() {
  // 检查缓存
  if (dataCache && Date.now() - cacheTime < CACHE_DURATION) {
    return dataCache;
  }

  try {
    const response = await fetch(`${API_BASE}/api/all`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    dataCache = await response.json();
    cacheTime = Date.now();
    return dataCache;
  } catch (error) {
    console.error('Failed to fetch data:', error);
    // 返回空数据结构
    return {
      members: [],
      plays: [],
      gallery: [],
      schedule: []
    };
  }
}

// 获取成员
async function fetchMembers() {
  const data = await fetchAllData();
  return data.members || [];
}

// 获取剧目
async function fetchPlays() {
  const data = await fetchAllData();
  return data.plays || [];
}

// 获取照片墙
async function fetchGallery() {
  const data = await fetchAllData();
  return data.gallery || [];
}

// 获取活动安排
async function fetchSchedule() {
  const data = await fetchAllData();
  return data.schedule || [];
}

// 兼容旧版 DataManager 的 API
const APIDataManager = {
  async get(module) {
    switch (module) {
      case 'members': return await fetchMembers();
      case 'plays': return await fetchPlays();
      case 'gallery': return await fetchGallery();
      case 'schedule': return await fetchSchedule();
      default: return [];
    }
  },
  
  async getAll() {
    return await fetchAllData();
  }
};
