import manImg from '../assets/smiling-boy.png'; // Adjust path if needed

const Man = ({ size = 24 }) => (
    <img src={manImg} alt="Man" style={{ width: size, height: size, borderRadius: '50%' }} />
);

export default Man;