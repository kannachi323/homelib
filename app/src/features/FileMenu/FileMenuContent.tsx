import { FileCreateItems } from './FileCreateItems';
import { FileUploadItems } from './FileUploadItems';
import { FileEditItems } from './FileEditItems';

export function FileMenuContent({showEditOptions = false} : {showEditOptions?: boolean}) {
  return (
    <>
     {showEditOptions &&
        <ul className="text-sm border-b pb-1">
          <FileEditItems/>
        </ul>
      
      }
      <ul className="text-sm border-b pb-1">
        <FileCreateItems/>
      </ul>

      <ul className="text-sm">
        <FileUploadItems/>
      </ul>
    </>
  );
}

