import { useEffect, useState } from 'react';
import { getReportedPosts, dismissReports } from '../../services/adminService';
import { deletePost } from '../../services/communityService';

// Content management: posts that users reported in the community
export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const load = () =>
    getReportedPosts()
      .then((list) => {
        setReports(list);
        setError('');
      })
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false));

  useEffect(() => {
    load();
  }, []);

  const run = async (action) => {
    try {
      await action();
      load();
    } catch (e) {
      alert(e.message);
    }
  };

  const removePost = (report) => {
    if (!window.confirm(`Remove this post by ${report.authorName}? The author will be notified.`)) return;
    run(() => deletePost(report.postId));
  };

  return (
    <>
      <header className="admin-header">
        <div>
          <p className="eyebrow">Community</p>
          <h1>Reported Posts</h1>
          <p style={{ color: '#64748b', margin: 0 }}>Remove posts that break the rules, or dismiss the reports if the post is fine.</p>
        </div>
      </header>

      {error && <p style={{ color: '#d93025', fontWeight: 'bold' }}>{error}</p>}
      {isLoading && <p>Loading…</p>}

      {!isLoading && reports.length === 0 && (
        <section className="section-card empty-state" style={{ textAlign: 'center', padding: '48px 20px' }}>
          <p>No reported posts. 🎉</p>
        </section>
      )}

      {reports.map((report) => (
        <section key={report.postId} className="section-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
            <div>
              <strong>{report.authorName}</strong>
              <small style={{ color: '#64748b', marginLeft: '8px' }}>posted {new Date(report.createdAt).toLocaleDateString()}</small>
            </div>
            <span className="status-pill status-pending">
              {report.reportCount} report{report.reportCount > 1 ? 's' : ''}
            </span>
          </div>

          <p style={{ margin: '12px 0', padding: '12px', background: '#f8fafc', borderRadius: '10px', whiteSpace: 'pre-wrap' }}>
            {report.content || <em style={{ color: '#94a3b8' }}>(photo only)</em>}
          </p>
          {report.mediaUrl && (
            <img src={report.mediaUrl} alt="Reported media" style={{ maxWidth: '240px', maxHeight: '180px', borderRadius: '10px', objectFit: 'cover' }} />
          )}

          <div style={{ marginTop: '8px', color: '#475569' }}>
            <strong>Reasons:</strong>
            <ul style={{ margin: '4px 0 0', paddingLeft: '18px' }}>
              {report.reasons.map((reason, index) => <li key={index}>{reason}</li>)}
            </ul>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
            <button className="btn btn-primary" style={{ background: '#d43a57' }} onClick={() => removePost(report)}>Remove Post</button>
            <button className="btn btn-secondary" onClick={() => run(() => dismissReports(report.postId))}>Dismiss Reports</button>
          </div>
        </section>
      ))}
    </>
  );
}
