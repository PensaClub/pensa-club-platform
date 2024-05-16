import { useEffect, useRef } from 'react';
import './noSignal.css'; // Assuming you save the CSS part in an App.css file

export const NoSignal = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const WIDTH = 700;
    const HEIGHT = 500;
    canvas.width = WIDTH;
    canvas.height = HEIGHT;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fill();
    let imgData = ctx.getImageData(0, 0, WIDTH, HEIGHT);
    let pix = imgData.data;

    const flickering = () => {
      for (let i = 0; i < pix.length; i += 4) {
        let color = (Math.random() * 255) + 50;
        pix[i] = color;
        pix[i + 1] = color;
        pix[i + 2] = color;
      }
      ctx.putImageData(imgData, 0, 0);
    };

    const flickerInterval = setInterval(flickering, 30);

    return () => {
      clearInterval(flickerInterval);
    };
  }, []);

  return (
    <>
    <div>
    
      {/* <h1>404 </h1> */}
      <div className="frame">
        <div></div>
        <div></div>
        <div></div>
      </div>
      <div className="caps">
        <img src="http://ademilter.com/caps.png" alt="" />
      </div>
      <canvas ref={canvasRef} id="canvas"></canvas>
    </div>
    </>
  );
};



  /* <h1>404 </h1>
      <h2>Не съществува такава страница</h2>
      <p>Върнете се към</p>

      <ul className="menu-list">
        <li className="menu-item">
          <Link to="/" className="menu-link">Начало</Link>
        </li>
        <li className="menu-item">
          <Link to="/map" className="menu-link">Карта</Link>
        </li>
        <li className="menu-item">
          <Link to="/craigslist" className="menu-link">Лист</Link>
        </li>
      </ul> */
