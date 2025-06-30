import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import Arguments from 'rsg-components/Arguments';
import Argument from 'rsg-components/Argument';
import JsDoc from 'rsg-components/JsDoc';
import Markdown from 'rsg-components/Markdown';
import Name from 'rsg-components/Name';
import Para from 'rsg-components/Para';
import Table from 'rsg-components/Table';
import Styled, { JssInjectedProps } from 'rsg-components/Styled';
import renderTypeColumn from './renderType';
import renderExtra from './renderExtra';
import renderDefault from './renderDefault';
import { PropDescriptor } from './util';
import * as Rsg from '../../../typings';
import { MdExpandMore, MdExpandLess, MdSearch, MdFilterList } from 'react-icons/md';

// Styles for the enhanced props renderer
export const styles = ({ space, color, fontFamily, fontSize }: Rsg.Theme) => ({
  propsWrapper: {
    marginBottom: space[4],
  },
  searchBar: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: space[2],
    padding: space[1],
    borderRadius: '4px',
    border: [[1, color.border, 'solid']],
    backgroundColor: color.baseBackground,
  },
  searchInput: {
    flex: 1,
    border: 'none',
    padding: space[1],
    fontFamily: fontFamily.base,
    fontSize: fontSize.base,
    backgroundColor: 'transparent',
    outline: 'none',
  },
  searchIcon: {
    marginRight: space[1],
    color: color.light,
  },
  filterIcon: {
    marginLeft: space[1],
    color: color.light,
    cursor: 'pointer',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: space[2],
    fontFamily: fontFamily.base,
    fontSize: fontSize.small,
  },
  pageInfo: {
    color: color.light,
  },
  pageButton: {
    padding: [[space[0], space[1]]],
    margin: [[0, space[0]]],
    backgroundColor: color.baseBackground,
    border: [[1, color.border, 'solid']],
    borderRadius: '3px',
    cursor: 'pointer',
    fontFamily: fontFamily.base,
    fontSize: fontSize.small,
    color: color.base,
    '&:disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
    '&:hover:not(:disabled)': {
      backgroundColor: color.lightest,
    },
  },
  requiredTag: {
    backgroundColor: color.light,
    color: color.baseBackground,
    padding: [[0, space[0]]],
    borderRadius: '3px',
    fontSize: fontSize.small,
    fontWeight: 'bold',
    marginLeft: space[1],
  },
  expandButton: {
    background: 'none',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    color: color.link,
    '&:hover': {
      color: color.linkHover,
    },
  },
  nestedProps: {
    marginLeft: space[3],
    borderLeft: [[1, color.border, 'solid']],
    paddingLeft: space[2],
  },
  filterDropdown: {
    position: 'absolute',
    right: 0,
    top: '100%',
    backgroundColor: color.baseBackground,
    border: [[1, color.border, 'solid']],
    borderRadius: '3px',
    padding: space[1],
    zIndex: 1000,
    boxShadow: '0 3px 5px rgba(0, 0, 0, 0.1)',
  },
  filterOption: {
    padding: [[space[0], space[1]]],
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: color.lightest,
    },
  },
});

function renderDescription(prop: PropDescriptor) {
  const { description, tags = {} } = prop;
  const extra = renderExtra(prop);
  const args = [...(tags.arg || []), ...(tags.argument || []), ...(tags.param || [])];
  const returnDocumentation = (tags.return && tags.return[0]) || (tags.returns && tags.returns[0]);

  return (
    <div>
      {description && <Markdown text={description} />}
      {extra && <Para>{extra}</Para>}
      <JsDoc {...tags} />
      {args.length > 0 && <Arguments args={args} heading />}
      {returnDocumentation && <Argument {...{ ...returnDocumentation, name: '' }} returns />}
    </div>
  );
}

function renderName(prop: PropDescriptor, classes: Record<string, string>) {
  const { name, tags = {}, required } = prop;
  return (
    <>
      <Name deprecated={!!tags.deprecated}>{name}</Name>
      {required && <span className={classes.requiredTag}>Required</span>}
    </>
  );
}

export function getRowKey(row: { name: string }) {
  return row.name;
}

interface EnhancedPropsProps extends JssInjectedProps {
  props: PropDescriptor[];
}

const ITEMS_PER_PAGE = 10;

const EnhancedPropsRenderer: React.FunctionComponent<EnhancedPropsProps> = ({ classes, props }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedProps, setExpandedProps] = useState<Record<string, boolean>>({});
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    showRequired: true,
    showOptional: true,
  });

  // Filter props based on search term and filter options
  const filteredProps = props.filter((prop) => {
    const matchesSearch = 
      prop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (prop.description && prop.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = 
      (prop.required && filterOptions.showRequired) ||
      (!prop.required && filterOptions.showOptional);
    
    return matchesSearch && matchesFilter;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredProps.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProps = filteredProps.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Handle page changes
  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterOptions]);

  // Toggle expanded state for nested props
  const toggleExpanded = (propName: string) => {
    setExpandedProps((prev) => ({
      ...prev,
      [propName]: !prev[propName],
    }));
  };

  // Enhanced columns with expandable functionality for nested types
  const columns = [
    {
      caption: 'Prop name',
      render: (prop: PropDescriptor) => renderName(prop, classes),
    },
    {
      caption: 'Type',
      render: (prop: PropDescriptor) => {
        const hasNestedProps = 
          prop.type?.name === 'shape' || 
          prop.type?.name === 'exact' || 
          prop.flowType?.name === 'signature' ||
          prop.tsType?.name === 'signature';
        
        if (hasNestedProps) {
          return (
            <div>
              {renderTypeColumn(prop)}
              <button 
                className={classes.expandButton}
                onClick={() => toggleExpanded(prop.name)}
                aria-label={expandedProps[prop.name] ? 'Collapse' : 'Expand'}
              >
                {expandedProps[prop.name] ? <MdExpandLess /> : <MdExpandMore />}
              </button>
            </div>
          );
        }
        return renderTypeColumn(prop);
      },
    },
    {
      caption: 'Default',
      render: renderDefault,
    },
    {
      caption: 'Description',
      render: renderDescription,
    },
  ];

  // Toggle filter dropdown
  const toggleFilterDropdown = () => {
    setFilterDropdownOpen((prev) => !prev);
  };

  // Update filter options
  const updateFilterOption = (option: keyof typeof filterOptions) => {
    setFilterOptions((prev) => ({
      ...prev,
      [option]: !prev[option],
    }));
  };

  return (
    <div className={classes.propsWrapper}>
      {/* Search and filter bar */}
      <div className={classes.searchBar}>
        <MdSearch className={classes.searchIcon} />
        <input
          type="text"
          className={classes.searchInput}
          placeholder="Search props..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div style={{ position: 'relative' }}>
          <MdFilterList 
            className={classes.filterIcon} 
            onClick={toggleFilterDropdown}
          />
          {filterDropdownOpen && (
            <div className={classes.filterDropdown}>
              <div 
                className={classes.filterOption}
                onClick={() => updateFilterOption('showRequired')}
              >
                <input 
                  type="checkbox" 
                  checked={filterOptions.showRequired} 
                  readOnly 
                /> Required Props
              </div>
              <div 
                className={classes.filterOption}
                onClick={() => updateFilterOption('showOptional')}
              >
                <input 
                  type="checkbox" 
                  checked={filterOptions.showOptional} 
                  readOnly 
                /> Optional Props
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Props table */}
      <Table columns={columns} rows={paginatedProps} getRowKey={getRowKey} />

      {/* Pagination controls */}
      {filteredProps.length > ITEMS_PER_PAGE && (
        <div className={classes.pagination}>
          <button 
            className={classes.pageButton}
            onClick={handlePrevPage}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className={classes.pageInfo}>
            Page {currentPage} of {totalPages} ({filteredProps.length} props)
          </span>
          <button 
            className={classes.pageButton}
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

EnhancedPropsRenderer.propTypes = {
  props: PropTypes.array.isRequired,
  classes: PropTypes.object.isRequired,
};

export default Styled<EnhancedPropsProps>(styles)(EnhancedPropsRenderer);