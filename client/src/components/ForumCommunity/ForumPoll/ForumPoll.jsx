import { useState } from 'react';
import { useForum } from '../../contexts/ForumProvider';
import { useAuthContext } from '../../contexts/UserContext';
import { BarChart3, Clock, Check } from 'lucide-react';
import './forumPoll.css';

const ForumPoll = ({ poll, userVotes = [], onVote }) => {
  const { votePoll } = useForum();
  const { isAuthentication } = useAuthContext();
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [voting, setVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(userVotes.length > 0);

  const isExpired = poll.expiresAt && new Date(poll.expiresAt) < new Date();
  const totalVotes = poll.totalVotes || 0;

  const handleToggleOption = (optionId) => {
    if (hasVoted || isExpired) return;
    if (poll.isMultipleChoice) {
      setSelectedOptions(prev =>
        prev.includes(optionId) ? prev.filter(id => id !== optionId) : [...prev, optionId]
      );
    } else {
      setSelectedOptions([optionId]);
    }
  };

  const handleVote = async () => {
    if (selectedOptions.length === 0 || voting) return;
    setVoting(true);
    try {
      await votePoll(poll.id, { optionIds: selectedOptions });
      setHasVoted(true);
      onVote?.();
    } catch (err) {
      console.error('Vote error:', err);
    } finally {
      setVoting(false);
    }
  };

  const getOptionVotes = (optionId) => {
    if (!poll.votes) return 0;
    return poll.votes.filter(v => v.optionId === optionId).length;
  };

  const getPercent = (optionId) => {
    if (totalVotes === 0) return 0;
    return Math.round((getOptionVotes(optionId) / totalVotes) * 100);
  };

  const showResults = hasVoted || isExpired;

  return (
    <div className="fpol-container">
      <div className="fpol-header">
        <BarChart3 size={16} className="fpol-header-icon" />
        <span className="fpol-question">{poll.question}</span>
        {poll.isMultipleChoice && <span className="fpol-multi-badge">Множествен избор</span>}
      </div>

      <div className="fpol-options">
        {(poll.options || []).map((opt) => {
          const percent = getPercent(opt.id);
          const isSelected = selectedOptions.includes(opt.id) || userVotes.includes(opt.id);

          return (
            <button
              key={opt.id}
              className={`fpol-option ${isSelected ? 'fpol-option-selected' : ''} ${showResults ? 'fpol-option-results' : ''}`}
              onClick={() => handleToggleOption(opt.id)}
              disabled={showResults}
            >
              <div className="fpol-option-content">
                {!showResults && (
                  <span className={`fpol-radio ${isSelected ? 'fpol-radio-checked' : ''}`}>
                    {isSelected && <Check size={10} />}
                  </span>
                )}
                <span className="fpol-option-text">{opt.text}</span>
                {showResults && <span className="fpol-option-percent">{percent}%</span>}
              </div>
              {showResults && (
                <div className="fpol-bar-bg">
                  <div
                    className={`fpol-bar-fill ${isSelected ? 'fpol-bar-selected' : ''}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="fpol-footer">
        <span className="fpol-votes-count">{totalVotes} гласа</span>

        {isExpired && (
          <span className="fpol-expired"><Clock size={12} /> Приключила</span>
        )}

        {poll.expiresAt && !isExpired && (
          <span className="fpol-expires">
            <Clock size={12} /> до {new Date(poll.expiresAt).toLocaleDateString('bg-BG')}
          </span>
        )}

        {!hasVoted && !isExpired && isAuthentication && (
          <button className="fpol-vote-btn" onClick={handleVote} disabled={selectedOptions.length === 0 || voting}>
            {voting ? '...' : 'Гласувай'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ForumPoll;
