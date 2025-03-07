import * as React from 'react';
import TablePagination from '@material-ui/core/TablePagination';
import { Theme } from '@material-ui/core/styles';
import { makeStyles } from '@material-ui/styles';
import { useGridSelector } from '../hooks/features/core/useGridSelector';
import { gridPaginationSelector } from '../hooks/features/pagination/gridPaginationSelector';
import { optionsSelector } from '../hooks/utils/optionsSelector';
import { GridApiContext } from './GridApiContext';
import { isMuiV5, createTheme } from '../utils';

const defaultTheme = createTheme();
// Used to hide the Rows per page selector on small devices
const useStyles = makeStyles(
  (theme: Theme) => ({
    selectLabel: {
      display: 'none',
      [theme.breakpoints.up('md')]: {
        display: 'block',
      },
    },
    caption: {
      // input label
      '&[id]': {
        display: 'none',
        [theme.breakpoints.up('md')]: {
          display: 'block',
        },
      },
    },
    input: {
      display: 'none',
      [theme.breakpoints.up('md')]: {
        display: 'inline-flex',
      },
    },
  }),
  { defaultTheme },
);

export const GridPagination = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function GridPagination(props, ref) {
  const classes = useStyles();
  const apiRef = React.useContext(GridApiContext);
  const paginationState = useGridSelector(apiRef, gridPaginationSelector);
  const lastPage = React.useMemo(
    () => Math.floor(paginationState.rowCount / (paginationState.pageSize || 1)),
    [paginationState.rowCount, paginationState.pageSize],
  );
  const options = useGridSelector(apiRef, optionsSelector);

  const onPageSizeChange = React.useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      const newPageSize = Number(event.target.value);
      apiRef!.current!.setPageSize(newPageSize);
    },
    [apiRef],
  );

  const onPageChange = React.useCallback(
    (event: any, page: number) => {
      apiRef!.current!.setPage(page);
    },
    [apiRef],
  );

  const getPaginationChangeHandlers = () => {
    if (isMuiV5()) {
      return {
        onPageChange,
        onRowsPerPageChange: onPageSizeChange,
      };
    }

    return {
      onChangePage: onPageChange,
      onChangeRowsPerPage: onPageSizeChange,
    };
  };

  return (
    // @ts-ignore TODO remove once upgraded v4 support is dropped
    <TablePagination
      ref={ref}
      classes={{
        ...(isMuiV5() ? { selectLabel: classes.selectLabel } : { caption: classes.caption }),
        input: classes.input,
      }}
      component="div"
      count={paginationState.rowCount}
      page={paginationState.page <= lastPage ? paginationState.page : lastPage}
      rowsPerPageOptions={
        options.rowsPerPageOptions &&
        options.rowsPerPageOptions.indexOf(paginationState.pageSize) > -1
          ? options.rowsPerPageOptions
          : []
      }
      rowsPerPage={paginationState.pageSize}
      {...getPaginationChangeHandlers()}
      {...props}
    />
  );
});
