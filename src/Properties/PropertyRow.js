import React from 'react';
import * as PropTypes from 'prop-types';
import classNames from 'classnames';
import {withStyles} from '@material-ui/core';
import TableCell from '@material-ui/core/es/TableCell/TableCell';
import TableRow from '@material-ui/core/TableRow/TableRow';
import Input from '@material-ui/core/Input/Input';
import Select from '@material-ui/core/Select/Select';

const styles = {
    row: {
        height: 32,
    },
    cell: {
        padding: '0 8px !important',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    firstCol: {
        width: '30%',
    },
    fullWidth: {
        width: '100%',
    },
    select: {
        paddingLeft: 8,
    },
};

const PropertyRow = props => {
    const {classes, name, value} = props;
    const showSelect = props.options;
    const showInput = props.editable && !props.options;
    const showStatic = !showInput && !showSelect;

    return (
        <TableRow className={classes.row}>
            <TableCell className={classNames(classes.cell, classes.firstCol)}>{name}</TableCell>

            <TableCell className={classes.cell}>
                {showInput && (
                    <Input
                        value={props.value}
                        className={classes.fullWidth}
                        onChange={e => {
                            props.onChange(props.propertyName, e.target.value);
                        }}
                        disableUnderline
                    />
                )}

                {showSelect && (
                    <Select
                        value={props.value || ''}
                        onChange={e => {
                            props.onChange(props.propertyName, e.target.value);
                        }}
                        classes={{
                            root: classes.fullWidth,
                            select: classes.select,
                        }}
                        disableUnderline
                        native
                    >
                        <React.Fragment>
                            <option value="" />

                            {props.options.map(option => (
                                <option key={option.code} value={option.code}>
                                    {option.name}
                                </option>
                            ))}
                        </React.Fragment>
                    </Select>
                )}

                {showStatic && value}
            </TableCell>
        </TableRow>
    );
};

PropertyRow.propTypes = {
    classes: PropTypes.object.isRequired,
    options: PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string.isRequired,
            code: PropTypes.string.isRequired,
        })
    ),
    name: PropTypes.string.isRequired,
    propertyName: PropTypes.string,
    value: PropTypes.any,
    onChange: PropTypes.func,
    editable: PropTypes.bool,
    native: PropTypes.bool,
};

export default withStyles(styles)(PropertyRow);
