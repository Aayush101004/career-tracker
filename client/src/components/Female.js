import womanImg from '../assets/smiling-girl.png'; // Adjust path if needed

const Female = ({ size = 24 }) => (
    <img src={womanImg} alt="Woman" style={{ width: size, height: size, borderRadius: '50%' }} />
);

export default Female;