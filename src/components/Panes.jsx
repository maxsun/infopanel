import React from 'react';
import PropTypes from 'prop-types';
import PanelGroup from 'react-panelgroup';
import './styles/Panes.css';

const Panes = (props) => {
  const { children } = props;
  return (
    <div className="Panes">
      <PanelGroup
        direction="row"
        panelWidths={[
          { minSize: 200, resize: 'dynamic' },
          { minSize: 500, resize: 'stretch' },
        ]}
      >
        {children}
      </PanelGroup>
    </div>
  );
};

Panes.defaultProps = {
  children: [],
};

Panes.propTypes = {
  children: PropTypes.instanceOf(Array),
};

export default Panes;
