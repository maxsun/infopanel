import React from 'react';
import PropTypes from 'prop-types';
import './styles/ListDisplay.css';

const ListDisplay = (props) => {
  const { title } = props;
  const { items } = props;
  const { onItemClick } = props;
  return (
    <div className="ListDisplay">
      {title !== '' ? <h2>{title}</h2> : null}
      <ul>
        {items.map((s, i) => (
          <li key={s + i.toString()}>
            <input
              type="button"
              value={s}
              onClick={(e) => onItemClick(e.target.value)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ListDisplay;

ListDisplay.defaultProps = {
  onItemClick: () => {},
  items: [],
  title: 'Hello',
};

ListDisplay.propTypes = {
  onItemClick: PropTypes.func,
  items: PropTypes.instanceOf(Array),
  title: PropTypes.string,
};
