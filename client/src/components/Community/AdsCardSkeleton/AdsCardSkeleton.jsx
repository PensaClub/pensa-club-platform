
import './adsCardSkeleton.css'
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export const AdsCardSkeleton = () => {
    return (
        <>
            <div className="ads-card">
                <div className="img-ads">
                    <Skeleton height={200} />
                    <Skeleton width={100} style={{ marginTop: '1rem' }} />
                </div>
                <div className="ads-info">
                    <h3 className="title-card">
                        <Skeleton width={200} />
                    </h3>
                    <div className="subinfo-ads">
                        <Skeleton width={80} height={20} />
                        <Skeleton width={80} height={20} />
                        <Skeleton width={80} height={20} />
                    </div>
                    <p className="ads-data">
                        <Skeleton width={150} />
                    </p>
                    <div className="ads-user-info">
                        <Skeleton circle width={40} height={40} />
                        <Skeleton width={100} />
                    </div>
                </div>
            </div>
        </>
    )
}