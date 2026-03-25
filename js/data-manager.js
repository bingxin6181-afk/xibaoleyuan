/**
 * 戏胞乐园 - 数据管理核心
 * 所有数据存储在 LocalStorage，支持导出导入
 */

const DB_KEY = 'cell_theater_data';

// 默认数据结构
const defaultData = {
    theater: {
        name: '戏胞乐园剧团',
        intro: '一个充满热爱与创造力的学生戏剧社团',
        description: '我们是一群热爱戏剧的年轻人，用舞台诠释青春，用表演传递情感。',
        poster: ''
    },
    members: [],
    gallery: [],
    plays: [],
    schedule: [
        { day: '周一', time: '19:00-21:00', activity: '基本功训练', location: '排练厅A' },
        { day: '周三', time: '19:00-21:00', activity: '剧本围读', location: '排练厅B' },
        { day: '周五', time: '19:00-21:00', activity: '剧目排练', location: '大排练厅' }
    ],
    partners: [],
    sponsors: {
        title: '给水世代',
        content: '感谢水世代对本剧团的大力支持！',
        logo: ''
    }
};

// 数据管理器
const DataManager = {
    // 获取所有数据
    getAll() {
        const data = localStorage.getItem(DB_KEY);
        return data ? JSON.parse(data) : JSON.parse(JSON.stringify(defaultData));
    },

    // 保存所有数据
    saveAll(data) {
        localStorage.setItem(DB_KEY, JSON.stringify(data));
    },

    // 获取模块数据
    get(module) {
        const data = this.getAll();
        return data[module] || [];
    },

    // 保存模块数据
    save(module, items) {
        const data = this.getAll();
        data[module] = items;
        this.saveAll(data);
    },

    // 添加单项
    add(module, item) {
        const items = this.get(module);
        item.id = Date.now().toString();
        item.createdAt = new Date().toISOString();
        items.push(item);
        this.save(module, items);
        return item;
    },

    // 更新单项
    update(module, id, updates) {
        const items = this.get(module);
        const index = items.findIndex(i => i.id === id);
        if (index !== -1) {
            items[index] = { ...items[index], ...updates, updatedAt: new Date().toISOString() };
            this.save(module, items);
            return items[index];
        }
        return null;
    },

    // 删除单项
    delete(module, id) {
        const items = this.get(module);
        const filtered = items.filter(i => i.id !== id);
        this.save(module, filtered);
    },

    // 重新排序（用于拖拽）
    reorder(module, newOrder) {
        this.save(module, newOrder);
    },

    // 批量导入
    importBatch(module, items) {
        const existing = this.get(module);
        const newItems = items.map((item, index) => ({
            ...item,
            id: Date.now().toString() + '_' + index,
            createdAt: new Date().toISOString()
        }));
        this.save(module, [...existing, ...newItems]);
        return newItems.length;
    },

    // 导出所有数据为 JSON 文件
    exportToFile() {
        const data = this.getAll();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `戏胞乐园数据备份_${new Date().toLocaleDateString()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    },

    // 从 JSON 文件导入
    importFromFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    this.saveAll(data);
                    resolve(data);
                } catch (err) {
                    reject(err);
                }
            };
            reader.readAsText(file);
        });
    },

    // 清空所有数据
    clear() {
        localStorage.removeItem(DB_KEY);
    }
};

// 图片处理工具
const ImageUtils = {
    // 将文件转为 base64
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    },

    // 压缩图片
    compressImage(base64, maxWidth = 800) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ratio = Math.min(maxWidth / img.width, 1);
                canvas.width = img.width * ratio;
                canvas.height = img.height * ratio;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL('image/jpeg', 0.8));
            };
            img.src = base64;
        });
    }
};

// 批量导入工具
const BatchImport = {
    // 解析 Excel/CSV 粘贴的文本
    parsePastedText(text) {
        // 支持制表符或逗号分隔
        const lines = text.trim().split('\n');
        const result = [];
        
        for (let line of lines) {
            // 尝试制表符分割
            let cols = line.split('\t');
            // 如果只有一列，尝试逗号分割
            if (cols.length === 1) {
                cols = line.split(',');
            }
            result.push(cols.map(c => c.trim()));
        }
        
        return result;
    },

    // 解析成员数据（假设列：姓名, 职位, 简介）
    parseMembers(text) {
        const rows = this.parsePastedText(text);
        return rows.map(row => ({
            name: row[0] || '',
            role: row[1] || '成员',
            intro: row[2] || '',
            avatar: ''
        })).filter(r => r.name);
    },

    // 解析剧目数据（假设列：剧名, 时间, 内容）
    parsePlays(text) {
        const rows = this.parsePastedText(text);
        return rows.map(row => ({
            name: row[0] || '',
            date: row[1] || '',
            content: row[2] || '',
            cover: ''
        })).filter(r => r.name);
    },

    // 解析活动安排（假设列：星期, 时间, 活动, 地点）
    parseSchedule(text) {
        const rows = this.parsePastedText(text);
        return rows.map(row => ({
            day: row[0] || '',
            time: row[1] || '',
            activity: row[2] || '',
            location: row[3] || ''
        })).filter(r => r.day);
    }
};
