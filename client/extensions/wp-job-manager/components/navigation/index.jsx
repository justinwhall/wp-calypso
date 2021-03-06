/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { find, flowRight, get, values } from 'lodash';

/**
 * Internal dependencies
 */
import HeaderCake from 'components/header-cake';
import SectionNav from 'components/section-nav';
import SectionNavTabs from 'components/section-nav/tabs';
import SectionNavTabItem from 'components/section-nav/item';
import { addSiteFragment } from 'lib/route';
import { getSections } from 'sections-middleware';
import { Tabs } from '../../constants';
import { getSiteSlug } from 'state/sites/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

class Navigation extends Component {
	static propTypes = {
		activeTab: PropTypes.string,
		siteSlug: PropTypes.string,
	};

	static defaultProps = {
		activeTab: '',
	};

	getSettingsPath() {
		const sections = getSections();
		const section = find( sections, value => value.name === 'wp-job-manager' );

		return get( section, 'settings_path' );
	}

	renderTabItem( { label, slug } ) {
		const { activeTab, siteSlug } = this.props;
		let path = this.getSettingsPath();

		if ( slug ) {
			path += `/${ slug }`;
		}

		if ( siteSlug ) {
			path += `/${ siteSlug }`;
		}

		return (
			<SectionNavTabItem key={ slug } path={ path } selected={ activeTab === slug }>
				{ label }
			</SectionNavTabItem>
		);
	}

	render() {
		const { siteSlug, translate } = this.props;

		return (
			<div>
				<HeaderCake
					backText={ translate( 'Plugin Overview' ) }
					backHref={ siteSlug && addSiteFragment( '/plugins/wp-job-manager', siteSlug ) }
				>
					WP Job Manager
				</HeaderCake>
				<SectionNav selectedText="Settings">
					<SectionNavTabs>
						{ values( Tabs ).map( tab => this.renderTabItem( tab ) ) }
					</SectionNavTabs>
				</SectionNav>
			</div>
		);
	}
}

const connectComponent = connect( state => {
	const siteId = getSelectedSiteId( state );

	return {
		siteSlug: getSiteSlug( state, siteId ),
	};
} );

export default flowRight( connectComponent, localize )( Navigation );
