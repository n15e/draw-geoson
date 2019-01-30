import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {withStyles} from '@material-ui/core';
import TableCell from '@material-ui/core/es/TableCell/TableCell';
import TableRow from '@material-ui/core/TableRow/TableRow';
import Input from '@material-ui/core/Input/Input';
import MenuItem from '@material-ui/core/es/MenuItem/MenuItem';
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
};

const PropertyRow = props => {
    const {classes, name, value} = props;
    const showSelect = props.options;
    const showInput = props.editable && !props.options;
    const showStatic = !props.editable;

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
                        value={props.value}
                        onChange={e => {
                            props.onChange(props.propertyName, e.target.value);
                        }}
                        className={classes.fullWidth}
                        disableUnderline
                    >
                        {props.options.map(option => (
                            <MenuItem key={option.code} value={option.code}>
                                {option.name}
                            </MenuItem>
                        ))}
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
    propertyName: PropTypes.string.isRequired,
    value: PropTypes.any.isRequired,
    onChange: PropTypes.func,
    editable: PropTypes.bool,
};

export default withStyles(styles)(PropertyRow);
