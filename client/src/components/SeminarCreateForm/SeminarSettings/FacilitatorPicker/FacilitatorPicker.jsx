// src/components/SeminarCreateForm/SeminarSettings/FacilitatorPicker/FacilitatorPicker.jsx
// Prefix: fp-

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, UserPlus, Star, X, GraduationCap, Shield, Globe } from 'lucide-react';
import { useAcademyCourses } from '../../../contexts/AcademyCoursesProvider';
import ExternalLecturerModal from '../ExternalLecturerModal/ExternalLecturerModal';
import './facilitatorPicker.css';

const ROLES = [
    { value: 'lecturer', icon: '🎓' },
    { value: 'mentor', icon: '👨‍🏫' },
    { value: 'assistant', icon: '🤝' },
    { value: 'guest', icon: '🌟' },
    { value: 'admin', icon: '🛡️' },
    { value: 'moderator', icon: '🎙️' },
];

const DEFAULT_ROLE_BY_TYPE = {
    mentor: 'mentor',
    admin: 'admin',
    external: 'lecturer',
};

const TYPE_META = {
    mentor: { icon: GraduationCap, cls: 'fp-badge-mentor' },
    admin: { icon: Shield, cls: 'fp-badge-admin' },
    external: { icon: Globe, cls: 'fp-badge-external' },
};

const getKey = (entry) => `${entry.type}:${entry.mentorId || entry.adminUserId || entry.externalLecturerId}`;
const getResultKey = (result) => `${result.type}:${result.id}`;

const makeEntryFromResult = (result, isFirst) => ({
    type: result.type,
    mentorId: result.type === 'mentor' ? result.id : null,
    adminUserId: result.type === 'admin' ? result.id : null,
    externalLecturerId: result.type === 'external' ? result.id : null,
    role: DEFAULT_ROLE_BY_TYPE[result.type] || 'mentor',
    isLead: isFirst,
    sortOrder: 0,
    name: result.name,
    email: result.email || null,
    phone: result.phone || null,
    photoUrl: result.photoUrl || null,
    specialization: result.specialization || null,
    organization: result.organization || null,
});

const FacilitatorPicker = ({ selected = [], onChange, placeholder }) => {
    const { t } = useTranslation('academy-admin');
    const { searchFacilitators } = useAcademyCourses();

    const [query, setQuery] = useState('');
    const [results, setResults] = useState({ mentors: [], admins: [], externals: [] });
    const [isSearching, setIsSearching] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [showExternalModal, setShowExternalModal] = useState(false);

    const wrapRef = useRef(null);
    const debounceRef = useRef(null);

    // Close on outside click
    useEffect(() => {
        const onClick = (e) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', onClick);
        return () => document.removeEventListener('mousedown', onClick);
    }, []);

    const runSearch = useCallback(async (q) => {
        if (!q || q.trim().length < 1) {
            setResults({ mentors: [], admins: [], externals: [] });
            return;
        }
        setIsSearching(true);
        try {
            const data = await searchFacilitators(q.trim(), 8);
            setResults({
                mentors: data?.mentors || [],
                admins: data?.admins || [],
                externals: data?.externals || [],
            });
        } catch (err) {
            console.error('Error searching facilitators:', err);
            setResults({ mentors: [], admins: [], externals: [] });
        } finally {
            setIsSearching(false);
        }
    }, [searchFacilitators]);

    const handleQueryChange = (e) => {
        const val = e.target.value;
        setQuery(val);
        setIsOpen(true);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => runSearch(val), 300);
    };

    const selectedKeys = new Set(selected.map(getKey));

    const handleAdd = (result) => {
        if (selectedKeys.has(getResultKey(result))) return;
        const entry = makeEntryFromResult(result, selected.length === 0);
        onChange([...selected, entry]);
        setQuery('');
        setResults({ mentors: [], admins: [], externals: [] });
        setIsOpen(false);
    };

    const handleRemove = (key) => {
        const next = selected.filter(e => getKey(e) !== key);
        if (next.length > 0 && !next.some(e => e.isLead)) {
            next[0] = { ...next[0], isLead: true };
        }
        onChange(next);
    };

    const handleRoleChange = (key, role) => {
        onChange(selected.map(e => (getKey(e) === key ? { ...e, role } : e)));
    };

    const handleToggleLead = (key) => {
        onChange(selected.map(e => ({ ...e, isLead: getKey(e) === key })));
    };

    const handleExternalCreated = (lecturer) => {
        setShowExternalModal(false);
        const result = {
            type: 'external',
            id: lecturer.id,
            name: lecturer.name,
            email: lecturer.email,
            phone: lecturer.phone,
            photoUrl: lecturer.photoUrl,
            organization: lecturer.organization,
        };
        handleAdd(result);
    };

    const filterAvailable = (list) => list.filter(r => !selectedKeys.has(getResultKey(r)));
    const availMentors = filterAvailable(results.mentors);
    const availAdmins = filterAvailable(results.admins);
    const availExternals = filterAvailable(results.externals);
    const hasAnyResults = availMentors.length + availAdmins.length + availExternals.length > 0;

    const renderTypeBadge = (type) => {
        const meta = TYPE_META[type];
        if (!meta) return null;
        const Icon = meta.icon;
        return (
            <span className={`fp-badge ${meta.cls}`}>
                <Icon size={12} />
                {t(`facilitatorPicker.types.${type}`, type)}
            </span>
        );
    };

    const renderResultItem = (result) => (
        <button
            key={getResultKey(result)}
            type="button"
            className="fp-dropdown-item"
            onClick={() => handleAdd(result)}
        >
            <img
                src={result.photoUrl || 'https://via.placeholder.com/36'}
                alt={result.name}
                className="fp-avatar"
            />
            <div className="fp-dropdown-info">
                <span className="fp-dropdown-name">{result.name}</span>
                {(result.specialization || result.organization || result.email) && (
                    <span className="fp-dropdown-sub">
                        {result.specialization || result.organization || result.email}
                    </span>
                )}
            </div>
            {renderTypeBadge(result.type)}
        </button>
    );

    return (
        <div className="fp-picker" ref={wrapRef}>
            <div className="fp-search-wrap">
                <Search size={16} className="fp-search-icon" />
                <input
                    type="text"
                    className="fp-search"
                    value={query}
                    onChange={handleQueryChange}
                    onFocus={() => setIsOpen(true)}
                    placeholder={placeholder || t('facilitatorPicker.searchPlaceholder', 'Търси ментор, админ или външен лектор...')}
                />
                {isSearching && <span className="fp-spinner" />}
            </div>

            {isOpen && (
                <div className="fp-dropdown">
                    {hasAnyResults ? (
                        <>
                            {availMentors.length > 0 && (
                                <div className="fp-dropdown-section">
                                    <div className="fp-dropdown-section-title">
                                        {t('facilitatorPicker.sections.mentors', 'Ментори')}
                                    </div>
                                    {availMentors.map(renderResultItem)}
                                </div>
                            )}
                            {availAdmins.length > 0 && (
                                <div className="fp-dropdown-section">
                                    <div className="fp-dropdown-section-title">
                                        {t('facilitatorPicker.sections.admins', 'Администратори')}
                                    </div>
                                    {availAdmins.map(renderResultItem)}
                                </div>
                            )}
                            {availExternals.length > 0 && (
                                <div className="fp-dropdown-section">
                                    <div className="fp-dropdown-section-title">
                                        {t('facilitatorPicker.sections.externals', 'Външни лектори')}
                                    </div>
                                    {availExternals.map(renderResultItem)}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="fp-dropdown-empty">
                            {query.trim().length < 1
                                ? t('facilitatorPicker.typeToSearch', 'Въведи поне 1 символ...')
                                : isSearching
                                    ? t('facilitatorPicker.searching', 'Търсене...')
                                    : t('facilitatorPicker.noResults', 'Няма резултати')}
                        </div>
                    )}

                    <button
                        type="button"
                        className="fp-add-external-btn"
                        onClick={() => {
                            setShowExternalModal(true);
                            setIsOpen(false);
                        }}
                    >
                        <UserPlus size={16} />
                        {t('facilitatorPicker.addExternal', 'Добави външен лектор')}
                    </button>
                </div>
            )}

            {selected.length > 0 && (
                <div className="fp-selected-list">
                    {selected.map((entry) => {
                        const key = getKey(entry);
                        return (
                            <div
                                key={key}
                                className={`fp-selected-item ${entry.isLead ? 'fp-selected-item--lead' : ''}`}
                            >
                                <img
                                    src={entry.photoUrl || 'https://via.placeholder.com/40'}
                                    alt={entry.name}
                                    className="fp-avatar fp-avatar--lg"
                                />
                                <div className="fp-selected-info">
                                    <div className="fp-selected-top">
                                        <span className="fp-selected-name">{entry.name}</span>
                                        {renderTypeBadge(entry.type)}
                                    </div>
                                    {(entry.specialization || entry.organization || entry.email) && (
                                        <span className="fp-selected-sub">
                                            {entry.specialization || entry.organization || entry.email}
                                        </span>
                                    )}
                                </div>

                                <select
                                    className="fp-role-select"
                                    value={entry.role}
                                    onChange={(e) => handleRoleChange(key, e.target.value)}
                                >
                                    {ROLES.map(r => (
                                        <option key={r.value} value={r.value}>
                                            {r.icon} {t(`facilitatorPicker.roles.${r.value}`, r.value)}
                                        </option>
                                    ))}
                                </select>

                                <button
                                    type="button"
                                    className={`fp-lead-btn ${entry.isLead ? 'fp-lead-btn--active' : ''}`}
                                    onClick={() => handleToggleLead(key)}
                                    title={t('facilitatorPicker.setAsLead', 'Задай като водещ')}
                                >
                                    <Star size={16} fill={entry.isLead ? 'currentColor' : 'none'} />
                                </button>

                                <button
                                    type="button"
                                    className="fp-remove-btn"
                                    onClick={() => handleRemove(key)}
                                    title={t('facilitatorPicker.remove', 'Премахни')}
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            <ExternalLecturerModal
                isOpen={showExternalModal}
                onClose={() => setShowExternalModal(false)}
                onSelect={handleExternalCreated}
            />
        </div>
    );
};

export default FacilitatorPicker;
