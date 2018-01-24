/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import { activateRewind as activateRewindAction } from 'state/activity-log/actions';
import { isRewindActivating } from 'state/selectors';

class ActivityLogRewindToggle extends Component {
	static propTypes = {
		siteId: PropTypes.number,
		label: PropTypes.string,

		// mappedSelectors
		isActivating: PropTypes.bool.isRequired,

		// bound dispatch
		activateRewind: PropTypes.func.isRequired,

		// localize
		translate: PropTypes.func.isRequired,
	};

	static defaultProps = {
		isActivating: false,
		label: '',
	};

	activateRewind = () => {
		const { activateRewind, siteId } = this.props;

		activateRewind( siteId );
	};

	render() {
		const { isActivating, siteId, translate, label } = this.props;

		const isSiteKnown = !! siteId;

		return (
			<Button
				className={ classNames( 'activity-log__rewind-toggle', {
					'is-busy': isSiteKnown && isActivating,
				} ) }
				primary
				disabled={ ! isSiteKnown || isActivating }
				onClick={ this.activateRewind }
			>
				{ label ? label : translate( 'Activate Rewind' ) }
			</Button>
		);
	}
}

export default connect(
	( state, { siteId } ) => ( {
		isActivating: isRewindActivating( state, siteId ),
	} ),
	{
		activateRewind: activateRewindAction,
	}
)( localize( ActivityLogRewindToggle ) );
