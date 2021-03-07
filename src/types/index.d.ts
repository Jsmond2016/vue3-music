/*
 * @Description: 
 * @Date: 2021-03-07 12:44:32
 * @Author: Jsmond2016 <jsmond2016@gmail.com>
 * @Copyright: Copyright (c) 2020, Jsmond2016
 */

export interface ISearchHotItem {
  searchWord: string;
  score: number;
  content: string;
  source: number;
  iconType: number;
  iconUrl: string;
  url: string;
  alg: string;
}

export interface ISearchSuggest {
  keyword: string;
  type: number;
  alg: string;
  lastKeyword: string;
  feature: string;
}

export interface Artists {
  id: number;
name: string;
picUrl: string;
alias: any;
albumSize: number;
picId: number;
img1v1Url: string;
img1v1: number;
}
export interface Album {
id: number;
name: string;
artist: Artists[];
publishTime: number;
size: number;
copyrightId: number;
status: number;
picId: number;
mark: number;
}
export interface ISearchListItem {
   id: number;
name: string;
artists: Artists[];
album: Album;
duration: number;
copyrightId: number;
status: number;
alias: any;
rtype: number;
ftype: number;
mvid: number;
fee: number;
rUrl: string;
mark: number;
}