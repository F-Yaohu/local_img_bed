import React, { useState } from 'react';
import { Modal, ProgressBar } from 'react-bootstrap';
import './Dashboard.css';

// 工具函数：按天分组
function groupByDate(uploads) {
  const groups = {};
  uploads.forEach(upload => {
    const date = new Date(upload.createTime).toLocaleDateString();
    if (!groups[date]) groups[date] = [];
    groups[date].push(upload);
  });
  // 日期从新到旧排序
  return Object.entries(groups).sort((a, b) => new Date(b[0]) - new Date(a[0]));
}

const DAYS_PER_PAGE = 3; // 每页显示4天

const Dashboard = ({ stats, recentUploads, config }) => {
  const groupedArr = groupByDate(recentUploads);
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageResolution, setImageResolution] = useState(null);

  const totalPages = Math.ceil(groupedArr.length / DAYS_PER_PAGE);
  const pagedGroups = groupedArr.slice((page - 1) * DAYS_PER_PAGE, page * DAYS_PER_PAGE);

  const handleThumbClick = (img) => {
    setSelectedImage(img);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedImage(null);
    setImageResolution(null); // Reset resolution on close
  };

  const handleImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    setImageResolution(`${naturalWidth} x ${naturalHeight}`);
  };

  // Calculate percentages for the progress bar
  const totalSpace = stats.totalSpace || 0;
  const imageUsableSpace = stats.imageUsableSpace || 0;
  const otherUsableSpace = stats.otherUsableSpace || 0;
  const unallocatedSpace = stats.unallocatedSpace || 0;

  const imagePercent = totalSpace > 0 ? (imageUsableSpace / totalSpace) * 100 : 0;
  const otherPercent = totalSpace > 0 ? (otherUsableSpace / totalSpace) * 100 : 0;
  const unallocatedPercent = totalSpace > 0 ? (unallocatedSpace / totalSpace) * 100 : 0;

  const toMB = (bit) => (bit / 1024 / 1024).toFixed(2);
  const toGB = (mb) => (mb / 1024).toFixed(2);
  
  const getImageUrl = (image, type) => {
    const base = config.imgBaseUrl || '';
    let url = `${base}/api/images/view/${image.id}?path=${encodeURIComponent(image.storagePath)}`;
     if (type) {
        url += `&type=${type}`;
    }
    return url;
  };

  return (
    <div className="dashboard">
      <h2>数据总览</h2>
      <div className="stats">
        <div className="stat-card">
          <h3>原图数量</h3>
          <p>{stats.totalImages}</p>
        </div>
        <div className="stat-card">
          <h3>原图大小</h3>
          <p>{stats.totalImageSize} MB</p>
        </div>
        <div className="stat-card">
          <h3>略缩图数量</h3>
          <p>{stats.totalThumbnails}</p>
        </div>
        <div className="stat-card">
          <h3>略缩图大小</h3>
          <p>{stats.totalThumbnailSize} MB</p>
        </div>
      </div>

      <div className="disk-space-section">
        <h3>磁盘空间使用情况 (总计: {toGB(totalSpace)} GB)</h3>
        <ProgressBar>
          <ProgressBar striped variant="primary" now={imagePercent} key={1} label={`${imagePercent.toFixed(2)}%`} />
          <ProgressBar striped variant="info" now={otherPercent} key={2} label={`${otherPercent.toFixed(2)}%`} />
          <ProgressBar striped variant="light" now={unallocatedPercent} key={3} label={`${unallocatedPercent.toFixed(2)}%`} />
        </ProgressBar>
        <div className="legend">
          <div className="legend-item">
            <span className="legend-color-box" style={{ backgroundColor: '#007bff' }}></span>
            图片空间: <strong>{toGB(imageUsableSpace)} GB</strong>
          </div>
          <div className="legend-item">
            <span className="legend-color-box" style={{ backgroundColor: '#17a2b8' }}></span>
            其他空间: <strong>{toGB(otherUsableSpace)} GB</strong>
          </div>
          <div className="legend-item">
            <span className="legend-color-box" style={{ backgroundColor: '#f8f9fa', border: '1px solid #ccc' }}></span>
            可用空间: <strong>{toGB(unallocatedSpace)} GB</strong>
          </div>
        </div>
      </div>

      <h2>最近上传</h2>
      <div className="recent-uploads-list">
        {pagedGroups.length === 0 && <div style={{color:'#888'}}>暂无上传</div>}
        {pagedGroups.map(([date, uploads]) => (
          <div key={date} className="recent-upload-group">
            <div className="recent-upload-date">{date}</div>
            <div className="recent-upload-thumbs">
              {uploads.map(upload => (
                <div
                  key={upload.id}
                  className="recent-thumb-item"
                  title={upload.filename}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleThumbClick(upload)}
                >
                  <img
                    src={getImageUrl(upload, 'small')}
                    alt={upload.filename}
                    className="recent-thumb-img"
                  />
                  <div className="recent-thumb-time">
                    {new Date(upload.createTime).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {totalPages > 1 && (
          <div className="recent-uploads-pagination">
            <button
              className="recent-uploads-page-btn"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >上一页</button>
            <span style={{margin: '0 10px'}}>{page} / {totalPages} 页</span>
            <button
              className="recent-uploads-page-btn"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >下一页</button>
          </div>
        )}
      </div>

      {/* 大图预览 Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="xl" centered>
        <Modal.Header closeButton>
          <Modal.Title>图片预览</Modal.Title>
        </Modal.Header>
        <Modal.Body className="image-modal-body">
          {selectedImage && (
            <div className="image-container">
              <img
                src={getImageUrl(selectedImage)}
                alt={selectedImage.originalName}
                onLoad={handleImageLoad}
              />
            </div>
          )}
          {selectedImage && (
            <div className="image-details">
              <h5>图片详情</h5>
              <p><strong>名称:</strong> {selectedImage.originalName}</p>
              <p><strong>类型:</strong> {selectedImage.fileType}</p>
              <p><strong>大小:</strong> {toMB(selectedImage.fileSize)} MB</p>
              <p><strong>分辨率:</strong> {imageResolution || '加载中...'}</p>
              <p><strong>上传时间:</strong> {new Date(selectedImage.createTime).toLocaleString()}</p>
              <a href={getImageUrl(selectedImage)+'&dFileName='+selectedImage.originalName} download={selectedImage.originalName} className="btn btn-primary w-100 mt-3">
                下载原图
              </a>
              <div className="link-container">
                <strong>原图:</strong>
                <input
                  type="text"
                  readOnly
                  value={getImageUrl(selectedImage)}
                  className="form-control form-control-sm mt-1"
                  onClick={(e) => e.target.select()}
                />
                <strong>头像:</strong>
                <input
                  type="text"
                  readOnly
                  value={getImageUrl(selectedImage, 'small')}
                  className="form-control form-control-sm mt-1"
                  onClick={(e) => e.target.select()}
                />
                <strong>中等:</strong>
                <input
                  type="text"
                  readOnly
                  value={getImageUrl(selectedImage, 'medium')}
                  className="form-control form-control-sm mt-1"
                  onClick={(e) => e.target.select()}
                />
                <strong>大图:</strong>
                <input
                  type="text"
                  readOnly
                  value={getImageUrl(selectedImage, 'large')}
                  className="form-control form-control-sm mt-1"
                  onClick={(e) => e.target.select()}
                />
              </div>
              
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Dashboard;
