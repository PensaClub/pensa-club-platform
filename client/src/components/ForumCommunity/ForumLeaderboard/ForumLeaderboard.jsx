// src/components/ForumCommunity/ForumLeaderboard/ForumLeaderboard.jsx
// Prefix: flb-

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { forumServiceFactory } from '../../Services/forumServiceFactory';
import ForumUserBadges from '../ForumUserBadges/ForumUserBadges';
import { Award } from 'lucide-react';
import './forumLeaderboard.css';

const MEDALS = ['🥇', '🥈', '🥉'];
const PERIODS = ['weekly', 'monthly', 'all'];

const ForumLeaderboard = () => {
  const { t } = useTranslation('forum');
  const [period, setPeriod] = useState('all');
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = useCallback(async (p) => {
    try {
      setLoading(true);
      const service = forumServiceFactory();
      const data = await service.getLeaderboard({ period: p });
      setLeaders(data.leaders || []);
    } catch {
      setLeaders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard(period);
  }, [period, fetchLeaderboard]);

  return (
    <div className="flb-container">
      <div className="flb-header">
        <Award size={16} className="flb-icon" />
        <span className="flb-title">{t('gamification.leaderboard.title', 'Top Contributors')}</span>
      </div>

      <div className="flb-tabs">
        {PERIODS.map(p => (
          <button
            key={p}
            className={`flb-tab ${period === p ? 'flb-tab-active' : ''}`}
            onClick={() => setPeriod(p)}
          >
            {t(`gamification.leaderboard.${p === 'all' ? 'allTime' : p}`, p)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flb-loading"><div className="flb-spinner" /></div>
      ) : leaders.length === 0 ? (
        <p className="flb-empty">{t('gamification.leaderboard.empty', 'No data yet')}</p>
      ) : (
        <div className="flb-list">
          {leaders.slice(0, 5).map((leader, i) => (
            <div key={leader.userId} className={`flb-item ${i < 3 ? 'flb-top' : ''}`}>
              <span className="flb-rank">
                {i < 3 ? MEDALS[i] : `${i + 1}.`}
              </span>
              <div className="flb-avatar">
                {leader.avatar
                  ? <img src={leader.avatar} alt="" />
                  : <span>{leader.name?.charAt(0) || '?'}</span>}
              </div>
              <div className="flb-info">
                <span className="flb-name">
                  {leader.name}
                  <ForumUserBadges badges={leader.badges} />
                </span>
                <span className="flb-score">{leader.score} {t('gamification.leaderboard.score', 'pts')}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ForumLeaderboard;
