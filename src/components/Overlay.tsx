import { Menu } from 'lucide-react';

export const Overlay = () => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: 10,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '40px'
    }}>
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        pointerEvents: 'auto'
      }}>
        <div style={{ fontWeight: 900, fontSize: '1.5rem', letterSpacing: '2px' }}>LEONARDO</div>
        <button style={{
          background: 'none',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          padding: '10px'
        }}>
          <Menu size={32} />
        </button>
      </header>

      <footer style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        pointerEvents: 'auto'
      }}>
        <div style={{ maxWidth: '300px', fontSize: '0.8rem', opacity: 0.6 }}>
          ESTABLISHED IN 2026. PUSHING THE BOUNDARIES OF DIGITAL EXPERIENCES.
        </div>
        <div style={{ display: 'flex', gap: '20px', fontWeight: 700 }}>
            <a href="#" style={{ color: 'white', textDecoration: 'none' }}>INSTAGRAM</a>
            <a href="#" style={{ color: 'white', textDecoration: 'none' }}>TWITTER</a>
        </div>
      </footer>
    </div>
  );
};
