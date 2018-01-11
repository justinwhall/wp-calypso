/** @format */

/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { map } from 'lodash';

/**
 * Internal dependencies
 */
import QuerySettingsProducts from 'woocommerce/components/query-settings-products';
import {
	areSettingsProductsLoaded,
	getWeightUnitSetting,
	getDimensionsUnitSetting,
} from 'woocommerce/state/sites/settings/products/selectors';
import { changeSettingsProductsSetting } from 'woocommerce/state/sites/settings/products/actions';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import FormLabel from 'components/forms/form-label';
import FormSelect from 'components/forms/form-select';

const ShippingUnits = ( { siteId, loaded, weight, dimensions, translate, change } ) => {
	const renderOption = option => {
		return (
			<option key={ option } value={ option }>
				{ option }
			</option>
		);
	};

	const onChangeWeight = e => {
		const setting = Object.assign( {}, weight, { value: e.target.value } );
		change( siteId, setting );
	};

	const onChangeDimensions = e => {
		const setting = Object.assign( {}, dimensions, { value: e.target.value } );
		change( siteId, setting );
	};

	return (
		<div className="shipping__units">
			<QuerySettingsProducts siteId={ siteId } />
			<div className="shipping__weight-select">
				<FormLabel>{ translate( 'Weight unit' ) }</FormLabel>
				<FormSelect onChange={ onChangeWeight } value={ weight.value } disabled={ ! loaded }>
					{ loaded && map( weight.options, renderOption ) }
				</FormSelect>
			</div>
			<div className="shipping__dimension-select">
				<FormLabel>{ translate( 'Dimension unit' ) }</FormLabel>
				<FormSelect
					onChange={ onChangeDimensions }
					value={ dimensions.value }
					disabled={ ! loaded }
				>
					{ loaded && map( dimensions.options, renderOption ) }
				</FormSelect>
			</div>
		</div>
	);
};

ShippingUnits.propTypes = {
	siteId: PropTypes.number,
};

function mapStateToProps( state ) {
	const site = getSelectedSiteWithFallback( state );
	const siteId = site && site.ID;
	return {
		siteId,
		loaded: areSettingsProductsLoaded( state, siteId ),
		weight: getWeightUnitSetting( state, siteId ),
		dimensions: getDimensionsUnitSetting( state, siteId ),
	};
}
function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			change: changeSettingsProductsSetting,
		},
		dispatch
	);
}

export default connect( mapStateToProps, mapDispatchToProps )( localize( ShippingUnits ) );
