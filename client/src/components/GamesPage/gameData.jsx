/* eslint-disable indent */
import { 
    faChess, 
    faPuzzlePiece, 
    faHeart,           // 🔧 ПРОМЕНЕНО: faSpade → faHeart
    faDice, 
    faSquare,
    faBullseye,        // 🔧 ПРОМЕНЕНО: faCrosshairs → faBullseye
    faGamepad,
    faBrain,
    faCalculator
} from '@fortawesome/free-solid-svg-icons';

export const gamesData = [
    {
        id: 1,
        name: 'games.names.chess',
        description: 'games.descriptions.chess',
        image: '/images/games/chess.jpg',
        url: 'https://www.chess.com/club/pensa-club',
        category: 'strategy',
        difficulty: 'medium',
        playerCount: 'games.playerCount.oneToTwo',
        icon: faChess
    },
    {
        id: 2,
        name: 'games.names.sudoku',
        description: 'games.descriptions.sudoku',
        image: '/images/games/darven-puzel-sudoku-02.jpg',
        url: 'https://sudoku.bg/',
        category: 'logic',
        difficulty: 'medium',
        playerCount: 'games.playerCount.single',
        icon: faPuzzlePiece
    },
    {
        id: 3,
        name: 'games.names.solitaire',
        description: 'games.descriptions.solitaire',
        image: '/images/games/solitarie.png',
        url: 'https://pasiansigra.com/',
        category: 'cards',
        difficulty: 'easy',
        playerCount: 'games.playerCount.single',
        icon: faHeart          
    },
    {
        id: 4,
        name: 'games.names.backgammon',
        description: 'games.descriptions.backgammon',
        image: '/images/games/TablaBG_og.png',
        url: 'https://belot.bg/tabla/',
        category: 'classic',
        difficulty: 'medium',
        playerCount: 'games.playerCount.two',
        icon: faDice
    },
    {
        id: 5,
        name: 'games.names.tetris',
        description: 'games.descriptions.tetris',
        image: '/images/games/tetris.png',
        url: 'https://tetris.com/play-tetris',
        category: 'arcade',
        difficulty: 'medium',
        playerCount: 'games.playerCount.single',
        icon: faSquare
    },
    {
        id: 6,
        name: 'games.names.game2048',
        description: 'games.descriptions.game2048',
        image: '/images/games/2048.jpg',
        url: 'https://play2048.co/',
        category: 'puzzle',
        difficulty: 'medium',
        playerCount: 'games.playerCount.single',
        icon: faCalculator
    },
    {
        id: 7,
        name: 'games.names.checkers',
        description: 'games.descriptions.checkers',
        image: '/images/games/shashki.jpg',
        url: 'https://lidraughts.org/',
        category: 'strategy',
        difficulty: 'easy',
        playerCount: 'games.playerCount.two',
        icon: faBullseye       // 🔧 ПРОМЕНЕНО: за шашки
    },
    {
        id: 8,
        name: 'games.names.mahjong',
        description: 'games.descriptions.mahjong',
        image: '/images/games/madjong.png',
        url: 'https://mahjong.bg/',
        category: 'logic',
        difficulty: 'hard',
        playerCount: 'games.playerCount.oneToFour',
        icon: faBrain
    }
];

export const gameCategories = [
    'all',
    'strategy', 
    'logic',
    'cards',
    'classic',
    'arcade',
    'puzzle'
];